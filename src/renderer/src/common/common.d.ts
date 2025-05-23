// PortInfo 类型定义
export declare interface PortInfo {
  path: string
  manufacturer?: string
  serialNumber?: string
  pnpId?: string
  friendlyName?: string
  vendorId?: string
  productId?: string
  locationId?: string
}

export declare interface AvailableDevice {
  serial: PortInfo[]
  usb: boolean
}
