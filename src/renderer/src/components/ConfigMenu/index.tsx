import lang from '@renderer/lang'

function ConfigMenu(): JSX.Element {
  const txt = lang()

  return (
    <>
      <div className="main-panel">
        <div className="menu-side">
          <div className="menu">
            <div className="menu-item">{txt('menu.appearance')}</div>
            <div className="menu-item">{txt('menu.devices')}</div>
            <div className="menu-item">{txt('menu.led')}</div>
          </div>
        </div>
        <div className="content bg-blue-500 text-white p-4 rounded animate__animated animate__bounce">
          <div className="config-title">{txt('apperance.language')}</div>
        </div>
      </div>
    </>
  )
}

export default ConfigMenu
