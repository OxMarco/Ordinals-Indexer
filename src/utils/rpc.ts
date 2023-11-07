import axios from 'axios';
import { sleep } from './helpers';

export class RPC {
  private rpcEndpoint;
  private logger;

  constructor(rpcEndpoint: string, logger: any) {
    this.rpcEndpoint = rpcEndpoint;
    this.logger = logger;
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
      timeout: 5000,
    };

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await axios.post(this.rpcEndpoint, payload, config);
        return response.data.result;
      } catch (error) {
        if (attempt === 2) {
          this.logger.error(
            `RPC Command Failed: ${method} ${JSON.stringify(params)}`,
          );
          return null;
        }
        await sleep((attempt + 1) * 1000);
      }
    }
  }
}
