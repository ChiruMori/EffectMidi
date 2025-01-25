import { ElectronAPI } from '@electron-toolkit/preload'

// PortInfo 类型定义
export declare interface PortInfo {
  path: string
  manufacturer: string | undefined
  serialNumber: string | undefined
  pnpId: string | undefined
  locationId: string | undefined
  productId: string | undefined
  vendorId: string | undefined
  friendlyName: string | undefined
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      listSerialPorts: () => Promise<PortInfo[]>
    }
  }
}
