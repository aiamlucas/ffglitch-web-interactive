import * as zmq from "zmq";

/*********************************************************************/
const addr_getter_ipc = "ipc:///tmp/ffglitch-getter";

/*********************************************************************/
const CANDIDATE_MB_TYPE_INTRA = (1 << 0);
const CANDIDATE_MB_TYPE_INTER = (1 << 1);

class Command
{
  constructor()
  {
    this.mbs_per_frame = 0;
  }

  setup(nb_frames)
  {
    if ( !this.mb_height )
    {
      console.log("mb_type cleaner still does not know dimensions");
      return;
    }

    const mb_height = this.mb_height;
    const mb_width = this.mb_width;
    const total_mbs = mb_height * mb_width;
    const mbs_per_frame = Math.ceil(total_mbs / nb_frames);
    this.mbs_per_frame = mbs_per_frame;

    // Cleanup local mb_types array with P macroblocks
    const cur_mb_types = this.mb_types;
    for ( let mb_y = 0; mb_y < mb_height; mb_y++ )
    {
      const row = cur_mb_types[mb_y];
      for ( let mb_x = 0; mb_x < mb_width; mb_x++ )
        row[mb_x] = CANDIDATE_MB_TYPE_INTER;
    }

    // Create array with all [ mb_y, mb_x ] indices
    const mb_array = new Array(total_mbs);
    for ( let mb_y = 0; mb_y < mb_height; mb_y++ )
      for ( let mb_x = 0; mb_x < mb_width; mb_x++ )
        mb_array[mb_y * mb_width + mb_x] = [ mb_y, mb_x ];

    // Randomly shuffle array
    for ( let i = mb_array.length; i > 0; )
    {
      const r = Math.floor(Math.random() * i);
      i--;
      [ mb_array[i], mb_array[r] ] = [ mb_array[r], mb_array[i] ];
    }

    this.mb_array = mb_array;
  }

  run(mb_types, nb_frames)
  {
    if ( nb_frames !== null && nb_frames !== 0 )
      this.setup(nb_frames);

    // On first run, create a local mb_types with the dimensions
    if ( !this.mb_height )
    {
      const cur_mb_types = [];
      const mb_height = mb_types.length;
      const mb_width = mb_types[0].length;

      for ( let mb_y = 0; mb_y < mb_height; mb_y++ )
        cur_mb_types[mb_y] = [];
      this.mb_types = cur_mb_types;
      this.mb_height = mb_height;
      this.mb_width = mb_width;
    }

    // Check if we need to run
    const mbs_per_frame = this.mbs_per_frame;
    if ( mbs_per_frame == 0 )
      return;

    // Check if we have finished running
    if ( this.mb_array.length == 0 )
    {
      this.mbs_per_frame = 0;
      return;
    }

    // Run
    {
      const cur_mb_types = this.mb_types;
      const mb_height = this.mb_height;
      const mb_width = this.mb_width;

      for ( let i = 0; this.mb_array.length != 0 && i < mbs_per_frame; i++ )
      {
        const cur_mv = this.mb_array.pop();
        cur_mb_types[cur_mv[0]][cur_mv[1]] = CANDIDATE_MB_TYPE_INTRA;
      }
      for ( let mb_y = 0; mb_y < mb_height; mb_y++ )
        for ( let mb_x = 0; mb_x < mb_width; mb_x++ )
          mb_types[mb_y][mb_x] = cur_mb_types[mb_y][mb_x];
    }
  }
}

/*********************************************************************/
let command;

let zmqctx;
let zmqsocket;

function zmqsocket_request()
{
  zmqsocket.send("cleaner.mb_type");
}

export function setup()
{
  zmqctx = new zmq.Context();
  zmqsocket = zmqctx.socket(zmq.REQ);
  zmqsocket.connect(addr_getter_ipc);
  zmqsocket_request();

  command = new Command();
}

export function mb_type_func(args)
{
  const data_str = zmqsocket.recv_str();
  zmqsocket_request();
  let nb_frames = null;
  try {
    nb_frames = JSON.parse(data_str);
  } catch (e) {
    console.log(`pict_type_func: JSON.parse('${data_str}'):`, e);
    return;
  }
  command.run(args.mb_types, nb_frames);
}
