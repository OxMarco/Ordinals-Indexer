import axios from 'axios';

export class RPC {
  rpcEndpoint;

  constructor(rpcEndpoint: string) {
    this.rpcEndpoint = rpcEndpoint;
  }

  async call(method: string, params: any[] = []): Promise<any> {
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
      console.error('Error sending RPC command:', error);
      throw new Error('RPC Command Failed');
    }
  }
}
