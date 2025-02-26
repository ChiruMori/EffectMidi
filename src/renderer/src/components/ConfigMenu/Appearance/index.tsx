import lang from '@renderer/lang'
import {
  bgImgSelector,
  bgImgSlice,
  langSelector,
  langSlice,
  particleSelector,
  particleSlice,
  themeSelector,
  themeSlice
} from '@renderer/config'
import { useAppDispatch, useAppSelector } from '@renderer/common/store'
import C, { ThemeTypeEnum } from '@renderer/common/colors'
import EmSelect from '../../basic/EmSelect'
import EmImgPicker from '@renderer/components/basic/EmImgPicker'
import EmRangeSlider from '@renderer/components/basic/EmRangeSlider'
import EmCubeChecker from '@renderer/components/basic/EmCubeChecker'
import EmSwitch from '@renderer/components/basic/EmSwitch'

export default function Appearance({ hidden }: { hidden: boolean }): JSX.Element {
  const txt = lang()
  const dispatch = useAppDispatch()
  const nowLang = useAppSelector(langSelector)
  const nowBgImg = useAppSelector(bgImgSelector)
  const nowColorType = useAppSelector(themeSelector)
  const nowParticle = useAppSelector(particleSelector)
  return (
    <div>
      <div
        hidden={hidden}
        className={`animate__animated animate__faster${hidden ? '' : ' animate__lightSpeedInRight'}`}
      >
        <EmSelect
          label={txt('appearance.language-label')}
          description={txt('appearance.language-desc')}
          options={[
            { label: '简体中文', val: 'zh_cn' },
            { label: 'English', val: 'en' }
          ]}
          onChange={(val) => {
            dispatch(langSlice.actions.setLang(val))
          }}
          initValue={nowLang}
        />
        <EmImgPicker
          label={txt('appearance.bg-img-label')}
          description={txt('appearance.bg-img-desc')}
          placeholder={txt('appearance.bg-img-placeholder')}
          initValue={nowBgImg.bgImg}
          onChange={(val) => dispatch(bgImgSlice.actions.setBgImg(val))}
        />
        <EmRangeSlider
          min={0}
          max={100}
          fromColor={C(nowColorType).main}
          toColor={C(nowColorType).sub}
          label={txt('appearance.bg-mask-opacity')}
          description={txt('appearance.bg-mask-opacity-desc')}
          initValue={nowBgImg.bgMaskOpacity}
          onChange={(val) => {
            dispatch(bgImgSlice.actions.setMaskOpacity(val))
          }}
        />
        <EmCubeChecker
          label={txt('appearance.theme-label')}
          description={txt('appearance.theme-desc')}
          options={[
            { color: C(ThemeTypeEnum.SKY).ingridient(45), val: ThemeTypeEnum.SKY },
            { color: C(ThemeTypeEnum.PURPLE).ingridient(45), val: ThemeTypeEnum.PURPLE },
            { color: C(ThemeTypeEnum.PINK).ingridient(45), val: ThemeTypeEnum.PINK },
            { color: C(ThemeTypeEnum.GREEN).ingridient(45), val: ThemeTypeEnum.GREEN },
            { color: C(ThemeTypeEnum.ORANGE).ingridient(45), val: ThemeTypeEnum.ORANGE },
            { color: C(ThemeTypeEnum.GRAY).ingridient(45), val: ThemeTypeEnum.GRAY }
          ]}
          initValue={nowColorType}
          onChange={(val) => {
            dispatch(themeSlice.actions.setType(val))
          }}
        />
        <EmSwitch
          label={txt('appearance.particle.fireflies-label')}
          description={txt('appearance.particle.fireflies-desc')}
          initValue={nowParticle.enableFirefiles}
          onChange={(val) => {
            dispatch(particleSlice.actions.setFirefiles(val))
          }}
        />
        <EmSwitch
          label={txt('appearance.particle.granule-label')}
          description={txt('appearance.particle.granule-desc')}
          initValue={nowParticle.enableClickGranule}
          onChange={(val) => {
            dispatch(particleSlice.actions.setClickGranule(val))
          }}
        />
        <EmSwitch
          label={txt('appearance.particle.waterfall-label')}
          description={txt('appearance.particle.waterfall-desc')}
          initValue={nowParticle.enableWaterfall}
          onChange={(val) => {
            dispatch(particleSlice.actions.setWaterfall(val))
          }}
        />
      </div>
    </div>
  )
}
