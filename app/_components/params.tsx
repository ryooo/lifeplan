import {Button} from "@nextui-org/react";
import {Slider} from "@nextui-org/slider";
import {Dispatch, SetStateAction, useCallback, useState} from "react";
import {AdultParams, AssetParams, ChildParams, isAdult} from "@/app/lib/query";
import {Adult, Asset, Child, Person} from "@/app/lib/type";

export const PersonParamsComponent = (props: {
  person: Person,
  updateParams: (params: (AdultParams | ChildParams | AssetParams)) => void;
  setSliderPopupProp: Dispatch<SetStateAction<SliderPopupProps | undefined>>;
}) => {
  if (isAdult(props.person)) {
    return <AdultParamsComponent
      person={props.person as Adult}
      updateParams={props.updateParams}
      setSliderPopupProp={props.setSliderPopupProp}
    />
  }
  return <ChildParamsComponent
    person={props.person as Child}
    updateParams={props.updateParams}
    setSliderPopupProp={props.setSliderPopupProp}
  />;
}

const ParamsInputComponent = (props: ParamsCommonProps & {
  keyName: keyof AdultParams | keyof ChildParams | keyof AssetParams;
  suffix: string;
  originalParams: AdultParams | ChildParams | AssetParams,
  updateParams: (params: (AdultParams | ChildParams | AssetParams)) => void;
  setSliderPopupProp: Dispatch<SetStateAction<SliderPopupProps | undefined>>;
  allowDecimal?: boolean;
}) => {
  const allowDecimal = props.allowDecimal === undefined ? false : props.allowDecimal;
  const [value, setValue] = useState(props.value.toString())
  const closePopup = () => props.setSliderPopupProp(undefined);
  const apply = useCallback((val: number) => {
    const newParams = {...props.originalParams}
    // @ts-ignore
    newParams[props.keyName] = val
    props.updateParams(newParams)
  }, [props])

  return (
    <>
      {props.title}：
      <input
        type="text"
        className="w-12 border-2 rounded-lg text-center mr-1"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={(e) => {
          const newValue = Number(e.target.value);
          if (!isNaN(newValue) && props.value !== newValue) {
            if (allowDecimal || e.target.value.indexOf('.') < 0) {
              setValue(e.target.value)
              apply(newValue)
              closePopup()
            }
          }
        }}
        onClick={(e) => {
          e.stopPropagation()
          props.setSliderPopupProp({
            closePopup,
            applyPopup: apply,
            setValue,
            title: props.title,
            value: props.value,
            minValue: props.minValue,
            maxValue: props.maxValue,
            step: props.step,
            // @ts-ignore
            position: {top: e.target.getBoundingClientRect().top + 25, left: e.target.offsetLeft},
          })
        }}
      />
      {props.suffix}
    </>
  )
}

const SexComponent = (props: {
  id: string,
  originalParams: AdultParams | ChildParams,
  updateParams: (params: (AdultParams | ChildParams | AssetParams)) => void;
}) => {
  return (
    <>
      性別：
      <label htmlFor={'sex-man-' + props.id}>男</label>
      <input
        type="radio"
        className="w-12 border-2 rounded-lg text-center mr-1"
        id={'sex-man-' + props.id}
        name={'sex-' + props.id}
        value="man"
        checked={props.originalParams.sex === 'man'}
        onClick={(e) => props.updateParams({...props.originalParams, sex: 'man'})}
      />
      <label htmlFor={'sex-woman-' + props.id}>女</label>
      <input
        type="radio"
        className="w-12 border-2 rounded-lg text-center mr-1"
        id={'sex-woman-' + props.id}
        name={'sex-' + props.id}
        value="woman"
        checked={props.originalParams.sex === 'woman'}
        onClick={(e) => props.updateParams({...props.originalParams, sex: 'woman'})}
      />
    </>
  )
}

const TotalExcludeComponent = (props: {
  id: string,
  originalParams: AdultParams | ChildParams,
  updateParams: (params: (AdultParams | ChildParams | AssetParams)) => void;
}) => {
  return (
    <>
      <label htmlFor={'total-exclude-' + props.id}>合算から除外</label>
      <input
        type="checkbox"
        className="w-12 border-2 rounded-lg text-center mr-1"
        id={'total-exclude-' + props.id}
        checked={props.originalParams.totalInclude}
        onClick={(e) => props.updateParams({...props.originalParams, totalInclude: !props.originalParams.totalInclude})}
      />
    </>
  )
}

type ParamsCommonProps = {
  title: string;
  value: number;
  minValue: number;
  maxValue: number;
  step: number;
}

export type SliderPopupProps = ParamsCommonProps & {
  closePopup: () => void;
  applyPopup: (v: number) => void;
  position: { top: number, left: number };
  setValue: Dispatch<SetStateAction<string>>;
}

export const SliderPopup = (props: SliderPopupProps) => {
  const [backdropDown, setBackdropDown] = useState(false)
  const [sliderValue, setSliderValue] = useState(props.value)

  if (!props.position) return <></>;
  return <div
    className={'fixed inset-0'}
    onPointerDown={() => setBackdropDown(true)}
    onClick={() => backdropDown && props.closePopup()}
  >
    <div className="fixed flex-col bg-gray-100 rounded-2xl w-64 justify-center p-3" style={props.position}>
      <div className="p-3">
        <Slider
          label={props.title}
          step={props.step}
          minValue={props.minValue}
          maxValue={props.maxValue}
          defaultValue={sliderValue}
          className="max-w-md"
          onChange={(val) => {
            setSliderValue(val as number)
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      </div>
      <div className='w-full flex justify-evenly'>
        <Button color="primary" onClick={() => {
          props.applyPopup(sliderValue)
          props.setValue(sliderValue.toString())
          props.closePopup()
        }}>決定</Button>
        <Button onClick={() => props.closePopup()}>キャンセル</Button>
      </div>
    </div>
  </div>
}

const AdultParamsComponent = (props: {
  person: Adult,
  updateParams: (params: (AdultParams | ChildParams | AssetParams)) => void;
  setSliderPopupProp: Dispatch<SetStateAction<SliderPopupProps | undefined>>;
}) => {
  return (
    <>
      <SexComponent id={props.person.id} originalParams={props.person.params} updateParams={props.updateParams} />
      <ParamsInputComponent
        {...props}
        originalParams={props.person.params}
        title={'年齢'}
        value={props.person.params.age}
        keyName={'age'}
        suffix={'歳'}
        step={1}
        minValue={0}
        maxValue={100}
        setSliderPopupProp={props.setSliderPopupProp}
      />、
      <ParamsInputComponent
        {...props}
        originalParams={props.person.params}
        title={'年収ピーク年齢'}
        value={props.person.params.peekAge}
        keyName={'peekAge'}
        suffix={'歳'}
        step={1}
        minValue={0}
        maxValue={100}
        setSliderPopupProp={props.setSliderPopupProp}
      />、
      <ParamsInputComponent
        {...props}
        originalParams={props.person.params}
        allowDecimal
        title={'年収上昇率'}
        value={props.person.params.toPeekRate}
        keyName={'toPeekRate'}
        suffix={'倍'}
        step={0.01}
        minValue={0.8}
        maxValue={1.5}
        setSliderPopupProp={props.setSliderPopupProp}
      />、
      <ParamsInputComponent
        {...props}
        originalParams={props.person.params}
        title={'定年'}
        value={props.person.params.retireAge}
        keyName={'retireAge'}
        suffix={'歳'}
        step={1}
        minValue={0}
        maxValue={100}
        setSliderPopupProp={props.setSliderPopupProp}
      />、
      <ParamsInputComponent
        {...props}
        originalParams={props.person.params}
        allowDecimal
        title={'年収下降率'}
        value={props.person.params.toRetireRate}
        keyName={'toRetireRate'}
        suffix={'倍'}
        step={0.01}
        minValue={0.5}
        maxValue={1}
        setSliderPopupProp={props.setSliderPopupProp}
      />、
      <ParamsInputComponent
        {...props}
        originalParams={props.person.params}
        title={'年収'}
        value={props.person.params.currentIncome}
        keyName={'currentIncome'}
        suffix={'万円/年'}
        step={1}
        minValue={0}
        maxValue={2000}
        setSliderPopupProp={props.setSliderPopupProp}
      />、
      <ParamsInputComponent
        {...props}
        originalParams={props.person.params}
        title={'年金'}
        value={props.person.params.pension}
        keyName={'pension'}
        suffix={'万円/月'}
        step={1}
        minValue={0}
        maxValue={40}
        setSliderPopupProp={props.setSliderPopupProp}
      />、
      <ParamsInputComponent
        {...props}
        originalParams={props.person.params}
        title={'生活費'}
        value={props.person.params.baseExpence}
        keyName={'baseExpence'}
        suffix={'万円/月'}
        step={1}
        minValue={0}
        maxValue={100}
        setSliderPopupProp={props.setSliderPopupProp}
      />、
      <TotalExcludeComponent id={props.person.id} originalParams={props.person.params} updateParams={props.updateParams} />
    </>
  )
}

const ChildParamsComponent = (props: {
  person: Child,
  updateParams: (params: (AdultParams | ChildParams | AssetParams)) => void;
  setSliderPopupProp: Dispatch<SetStateAction<SliderPopupProps | undefined>>;
}) => {

  return (
    <>
      <SexComponent id={props.person.id} originalParams={props.person.params} updateParams={props.updateParams} />
      <ParamsInputComponent
        {...props}
        originalParams={props.person.params}
        title={'年齢'}
        value={props.person.params.age}
        keyName={'age'}
        suffix={'歳'}
        step={1}
        minValue={0}
        maxValue={100}
        setSliderPopupProp={props.setSliderPopupProp}
      />、
      <ParamsInputComponent
        {...props}
        originalParams={props.person.params}
        title={'高校学費'}
        value={props.person.params.highSchoolExpence}
        keyName={'highSchoolExpence'}
        suffix={'万円/月'}
        step={1}
        minValue={0}
        maxValue={40}
        setSliderPopupProp={props.setSliderPopupProp}
      />、
      <ParamsInputComponent
        {...props}
        originalParams={props.person.params}
        title={'大学学費'}
        value={props.person.params.universityExpence}
        keyName={'universityExpence'}
        suffix={'万円/月'}
        step={1}
        minValue={0}
        maxValue={100}
        setSliderPopupProp={props.setSliderPopupProp}
      />、
      <ParamsInputComponent
        {...props}
        originalParams={props.person.params}
        title={'生活費'}
        value={props.person.params.baseExpence}
        keyName={'baseExpence'}
        suffix={'万円/月'}
        step={1}
        minValue={0}
        maxValue={100}
        setSliderPopupProp={props.setSliderPopupProp}
      />、
      <TotalExcludeComponent id={props.person.id} originalParams={props.person.params} updateParams={props.updateParams} />
    </>
  )
}

export const AssetParamsComponent = (props: {
  asset: Asset,
  updateParams: (params: (AdultParams | ChildParams | AssetParams)) => void;
  setSliderPopupProp: Dispatch<SetStateAction<SliderPopupProps | undefined>>;
}) => {

  return (
    <>
      <ParamsInputComponent
        {...props}
        originalParams={props.asset.params}
        title={'年齢'}
        value={100}
        keyName={'age'}
        suffix={'歳'}
        step={1}
        minValue={0}
        maxValue={100}
        setSliderPopupProp={props.setSliderPopupProp}
      />
    </>
  )
}
