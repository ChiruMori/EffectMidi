/* eslint-disable @typescript-eslint/no-explicit-any */

import { PortInfo } from './common.d'

const server = window.electron.ipcRenderer

export default {
  // IPC Test
  ping: (): void => server.send('ping'),
  // List all serial ports
  listSerialPorts: async (): Promise<PortInfo[]> => {
    return await server.invoke('listSerialPorts')
  },
  // Storage
  storage: {
    get: async (key: string): Promise<any> => {
      return await server.invoke('storage.get', key)
    },
    set: async (key: string, value: any): Promise<void> => {
      return await server.invoke('storage.set', key, value)
    },
    remove: async (key: string): Promise<void> => {
      return await server.invoke('storage.remove', key)
    }
  }
}
