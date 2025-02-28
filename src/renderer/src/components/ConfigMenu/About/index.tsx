import { useAppSelector } from "@renderer/common/store"
import { statisticsSelector, themeSelector } from "@renderer/config"
import ipc from "@renderer/common/ipcClient"
import lang from "@renderer/lang"
import icon from "@root/resources/EffectMidi_1024.png"
import pkg from "@root/package.json"
import { ArrowUturnLeftIcon } from "@heroicons/react/20/solid"


export default function About({ hidden }: { hidden: boolean }): JSX.Element {
  const statistics = useAppSelector(statisticsSelector)
  const theme = useAppSelector(themeSelector)
  const txt = lang()
  // 支持浏览器打开链接
  const openLink = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string): void => {
    e.preventDefault()
    ipc.openBrowser(href)
  }

  return (
    <div
      hidden={hidden}
      className={`px-5 animate__animated animate__faster${hidden ? '' : ' animate__lightSpeedInRight'}`}>
      <img src={icon} alt="icon" className="w-20 h-20 mx-auto my-5" />
      <p className="text-center text-sm text-gray-300">{pkg.name} - {pkg.version}</p>
      <hr className="my-5 border-gray-500" />
      <p className="inline">
        <span>{txt('about.desc1')} </span>
        <a onClick={(e) => openLink(e, pkg.homepage)} className={`inline-flex items-center cursor-pointer underline text-${theme}-sub`}>
          <span>Github</span>
          <span><ArrowUturnLeftIcon className="size-3" /></span>
        </a>
        <span> {txt('about.desc2')}</span>
      </p>
      <p className="mt-5">{txt('about.desc3')}</p>

      <hr className="my-5 border-gray-500" />
      <h1 className="text-2xl font-bold">{txt('about.stat-title')}</h1>
      <p className="mt-4">{txt('about.stat-score')}: <span className={`text-${theme}-sub`}>{statistics.score ?? 0}</span></p>
      <p>{txt('about.stat-paddle')}: <span className={`text-${theme}-sub`}>{statistics.paddle ?? 0}</span></p>
    </div>
  )
}
