import axios from 'axios';

export class RPC {
  private rpcEndpoint;

  constructor(rpcEndpoint: string) {
    this.rpcEndpoint = rpcEndpoint;
  }

  async call(method: string, params: any[] = []) {
    const payload = {
      jsonrpc: '1.0',
      id: 'rpc_call_' + Date.now(),
      method,
      params,
    };

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await axios.post(this.rpcEndpoint, payload, config);
      return response.data.result;
    } catch (error) {
      throw new Error('RPC Command Failed');
    }
  }
}
