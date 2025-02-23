import lang from '@renderer/lang'
import MenuItem from './MenuItem'
import './index.styl'

export default function MenuSlide(): JSX.Element {
  const txt = lang()
  return (
    <div className="menu-side text-center px-4 relative">
      <div className="menu text-2xl relative overflow-hidden">
        <MenuItem menuKey="appearance">{txt('menu.appearance')}</MenuItem>
        <MenuItem menuKey="devices">{txt('menu.devices')}</MenuItem>
        <MenuItem menuKey="led">{txt('menu.led')}</MenuItem>
        <hr className="menu-hr my-4 border-gray-600 border-dashed max-w-48" />
        <MenuItem menuKey="about">{txt('menu.about')}</MenuItem>
      </div>
    </div>
  )
}
