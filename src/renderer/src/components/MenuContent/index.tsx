import { MenuOptions } from '../MenuSlide'
import lang, { selectLang } from '@renderer/lang'
import { langSlice } from '@renderer/config'
import { useAppDispatch, useAppSelector } from '@renderer/common/store'
import EmSelect from '../basic/EmSelect'
import EmRange from '../basic/EmRange'

export default function MenuContent({ menu }: { menu: MenuOptions }): JSX.Element {
  const txt = lang()
  const dispatch = useAppDispatch()
  const nowLang = useAppSelector(selectLang)
  return (
    <div>
      <div
        hidden={menu !== 'appearance'}
        className={`animate__animated animate__faster${menu === 'appearance' ? ' animate__lightSpeedInRight' : ''}`}
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
      </div>
      <div
        hidden={menu !== 'devices'}
        className={`animate__animated animate__faster w-32 ${menu === 'devices' ? 'animate__lightSpeedInRight' : ''}`}
      >
        <EmRange max={100} min={0} fromColor='#000000' toColor='#4CAF50'/>
      </div>
    </div>
  )
}
