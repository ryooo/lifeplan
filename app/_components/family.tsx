import {Dispatch, SetStateAction, useCallback, useContext, useState} from "react";
import {familyContext} from "@/app/privoders/family";
import {LifeEventComponent} from "@/app/_components/life-event";
import {Adult, Child, Family, Person} from "@/app/lib/type";
import {AssetComponent} from "@/app/_components/assets";
import {AdultParams, ChildParams, createAdult, createChild, isAdult, isMan, isWoman} from "@/app/lib/query";
import StreamlineEmojisManOfficeWorker2 from "@/app/icons/StreamlineEmojisManOfficeWorker2";
import FluentEmojiFlatWhiteQuestionMark from "@/app/icons/FluentEmojiFlatWhiteQuestionMark";
import StreamlineEmojisBoy2 from "@/app/icons/StreamlineEmojisBoy2";
import StreamlineEmojisGirl2 from "@/app/icons/StreamlineEmojisGirl2";
import StreamlineEmojisWomanOfficeWorker2 from "@/app/icons/StreamlineEmojisWomanOfficeWorker2";
import {Slider} from "@nextui-org/slider";
import {Button} from "@nextui-org/react";

export const FamilyComponent = () => {
  const [sliderPopupProp, setSliderPopupProp] = useState<SliderPopupProps | undefined>()
  const {family} = useContext(familyContext);
  return (
    <>
      {family.adults.map(c => <PersonComponent key={c.id} person={c} setSliderPopupProp={setSliderPopupProp}/>)}
      {family.children.map(c => <PersonComponent key={c.id} person={c} setSliderPopupProp={setSliderPopupProp}/>)}
      <div>
        {
          (family.assets || []).map((asset, i) => {
            return <AssetComponent key={i} assetIndex={i} asset={family.assets[i]}/>
          })
        }
      </div>
      {sliderPopupProp && <SliderPopup {...sliderPopupProp} />}
    </>
  )
}

type Props = {
  person: Person;
  setSliderPopupProp: Dispatch<SetStateAction<SliderPopupProps | undefined>>;
}

const PersonComponent = ({person, setSliderPopupProp}: Props) => {
  const [opened, setOpened] = useState(false)

  const {family, setFamily} = useContext(familyContext);

  const updateParams = useCallback((params: AdultParams | ChildParams) => {
    const newFamily = {...family}
    const adultIndex = newFamily.adults.findIndex(a => a.id === person.id)
    if (adultIndex >= 0) {
      newFamily.adults[adultIndex] = createAdult(params as AdultParams)
    } else {
      const childIndex = newFamily.children.findIndex(a => a.id === person.id)
      if (childIndex >= 0) {
        newFamily.children[childIndex] = createChild(params as ChildParams)
      }
    }

    setFamily(newFamily)
  }, [family, person])

  return (
    <div className="my-3">
      <h2>
        <button
          type="button"
                className="rounded-t-xl flex items-center justify-between w-full p-5 font-medium rtl:text-right text-gray-500 border border-gray-200 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
                data-accordion-target="#accordion-open-body-1" onClick={(e) => {
          setOpened(!opened)
        }}>
          <span className="flex items-center text-2xl">
            {getIcon(person)}{person.name}
          </span>
          <svg className="w-3 h-3 rotate-180 shrink-0" aria-hidden="true"
               xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5 5 1 1 5"/>
          </svg>
        </button>
        <div
          className={(opened ? "" : "rounded-b-xl ") + "p-5 border border-gray-200 dark:border-gray-700 dark:bg-gray-900"}>
          <ParamsComponent person={person} updateParams={updateParams} setSliderPopupProp={setSliderPopupProp}/>
        </div>
      </h2>
      <div className={opened ? "" : "hidden"}>
        <div
          className={"rounded-b-xl p-5 border border-gray-200 dark:border-gray-700 dark:bg-gray-900"}>
          {
            person.lifeEvents.map((event, i) => {
              return <LifeEventComponent key={i} eventIndex={i} personId={person.id}/>
            })
          }
        </div>
      </div>
    </div>
  )
}

export const getIcon = (person: Person) => {
  if (isMan(person)) {
    if (isAdult(person)) {
      return <StreamlineEmojisManOfficeWorker2 fontSize={80}/>
    }
    return <StreamlineEmojisBoy2 fontSize={80}/>
  } else if (isWoman(person)) {
    if (isAdult(person)) {
      return <StreamlineEmojisWomanOfficeWorker2 fontSize={80}/>
    }
    return <StreamlineEmojisGirl2 fontSize={80}/>
  }
  return <FluentEmojiFlatWhiteQuestionMark fontSize={80}/>
}

export const getAllMembers = (family: Family): Person[] => {
  const members: Person[] = []
  members.push(...family.adults)
  members.push(...family.children)
  return members
}

const ParamsComponent = (props: {
  person: Person,
  updateParams: (params: (AdultParams | ChildParams)) => void;
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
  keyName: keyof AdultParams | keyof ChildParams;
  suffix: string;
  person: Adult | Child,
  updateParams: (params: (AdultParams | ChildParams)) => void;
  setSliderPopupProp: Dispatch<SetStateAction<SliderPopupProps | undefined>>;
  allowDecimal?: boolean;
}) => {
  const allowDecimal = props.allowDecimal === undefined ? false : props.allowDecimal;
  const [value, setValue] = useState(props.value.toString())
  const closePopup = () => props.setSliderPopupProp(undefined);
  const apply = useCallback((val: number) => {
    const newParams = {...props.person.params}
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

type ParamsCommonProps = {
  title: string;
  value: number;
  minValue: number;
  maxValue: number;
  step: number;
}

type SliderPopupProps = ParamsCommonProps & {
  closePopup: () => void;
  applyPopup: (v: number) => void;
  position: { top: number, left: number };
  setValue: Dispatch<SetStateAction<string>>;
}

const SliderPopup = (props: SliderPopupProps) => {
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
  updateParams: (params: (AdultParams | ChildParams)) => void;
  setSliderPopupProp: Dispatch<SetStateAction<SliderPopupProps | undefined>>;
}) => {
  return (
    <>
      <ParamsInputComponent
        {...props}
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
        title={'生活費'}
        value={props.person.params.baseExpence}
        keyName={'baseExpence'}
        suffix={'万円/月'}
        step={1}
        minValue={0}
        maxValue={100}
        setSliderPopupProp={props.setSliderPopupProp}
      />
    </>
  )
}

const ChildParamsComponent = (props: {
  person: Child,
  updateParams: (params: (AdultParams | ChildParams)) => void;
  setSliderPopupProp: Dispatch<SetStateAction<SliderPopupProps | undefined>>;
}) => {

  return (
    <>
      <ParamsInputComponent
        {...props}
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
        title={'生活費'}
        value={props.person.params.baseExpence}
        keyName={'baseExpence'}
        suffix={'万円/月'}
        step={1}
        minValue={0}
        maxValue={100}
        setSliderPopupProp={props.setSliderPopupProp}
      />
    </>
  )
}