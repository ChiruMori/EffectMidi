import lang, { selectLang } from '@renderer/lang'
import { bgImgSlice, langSlice } from '@renderer/config'
import { useAppDispatch, useAppSelector } from '@renderer/common/store'
import EmSelect from '../../basic/EmSelect'
import EmImgPicker from '@renderer/components/basic/EmImgPicker'
import EmRangeSlider from '@renderer/components/basic/EmRangeSlider'

export default function Appearance({ hidden }: { hidden: boolean }): JSX.Element {
  const txt = lang()
  const dispatch = useAppDispatch()
  const nowLang = useAppSelector(selectLang)
  const nowBgImg = useAppSelector((state) => state.bg)
  return (
    <div>
      <div
        hidden={hidden}
        className={`animate__animated animate__faster${hidden ? '' : ' animate__lightSpeedInRight'}`}
      >
        <EmSelect
          label={txt('appearance.language')}
          description={txt('appearance.language-desc')}
          options={[
            { label: '简体中文', val: 'zh_cn' },
            { label: 'English', val: 'en' }
          ]}
          onChange={(val) => dispatch(langSlice.actions.setLang(val))}
          initialValue={nowLang}
        />
        <EmImgPicker
          label={txt('appearance.bg-img-label')}
          description={txt('appearance.bg-img-desc')}
          placeholder={txt('appearance.bg-img-placeholder')}
          onChange={(val) => dispatch(bgImgSlice.actions.setBgImg(val))}
        />
        <EmRangeSlider
          min={0}
          max={100}
          label={txt('appearance.bg-mask-opacity')}
          description={txt('appearance.bg-mask-opacity-desc')}
          initValue={`${nowBgImg.maskOpacity}`}
          onChange={(val) => dispatch(bgImgSlice.actions.setMaskOpacity(val))}
        />
      </div>
    </div>
  )
}
