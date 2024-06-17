"use client"
import {
  Asset,
  ASSET_COLOR,
  ASSET_COLOR_BG, Balances,
  CashFlows, Family, getPerson,
  INCOME_COLOR,
  INCOME_COLOR_BG, LifeEvent,
  OUTCOME_COLOR,
  OUTCOME_COLOR_BG, Person,
  Year
} from "@/app/lib/type";
import React, {useCallback, useContext, useEffect, useRef, useState} from "react";

import {ChartData, ChartDataset, ChartOptions} from "chart.js";
import {Line} from "react-chartjs-2";
import {familyContext} from "@/app/privoders/family";
import {invariant, YEARS} from "@/app/lib/helper";
import {AssetParamsComponent, SliderPopup, SliderPopupProps} from "@/app/_components/params";
import {AdultParams, AssetParams, ChildParams, createAsset} from "@/app/lib/query";
import StreamlineEmojisMoneyBag from "@/app/icons/StreamlineEmojisMoneyBag";
import StreamlineEmojisDollarBanknote from "@/app/icons/StreamlineEmojisDollarBanknote";


type Props = {
  assetIndex: number;
  asset: Asset;
}

export const AssetComponent = ({assetIndex, asset}: Props) => {
  const [sliderPopupProp, setSliderPopupProp] = useState<SliderPopupProps | undefined>()
  const [opened, setOpened] = useState(asset.opened)
  const {family, setFamily} = useContext(familyContext);
  const [data, setData] = useState<ChartData<'line'> | null>(null);

  const onDragEnd = useCallback((index: number, val: number): void => {
    const newFamily = {...family}
    const asset = newFamily.assets[assetIndex]
    const year = YEARS[index];
    asset.cashFlows[year] = val
    setFamily(newFamily)
  }, [])

  useEffect(() => {
    setData(createData(asset))
  }, [family, asset])

  const updateParams = useCallback((params: AdultParams | ChildParams | AssetParams) => {
    const newFamily = {...family}
    const adultIndex = newFamily.assets.findIndex(a => a.id === asset.id)
    invariant(adultIndex >= 0, "invalid adult id")
    newFamily.assets[adultIndex] = createAsset(params as AssetParams)

    setFamily(newFamily)
  }, [family, asset, opened])


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
            {getIcon(asset)}{asset.name} シミュレーション
          </span>
          <svg className="w-3 h-3 rotate-180 shrink-0" aria-hidden="true"
               xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5 5 1 1 5"/>
          </svg>
        </button>
        <div
          className={(opened ? "" : "rounded-b-xl ") + "p-5 border border-gray-200 dark:border-gray-700 dark:bg-gray-900"}>
          <AssetParamsComponent asset={asset} updateParams={updateParams} setSliderPopupProp={setSliderPopupProp}/>
        </div>
      </h2>
      <div className={opened ? "" : "hidden"}>
        <div
          className={"rounded-b-xl p-5 border border-gray-200 dark:border-gray-700 dark:bg-gray-900"}>
          {data && <Line data={data} options={createOptions(data, onDragEnd)} height="200" width="100%"/>}
        </div>
      </div>
      {sliderPopupProp && <SliderPopup {...sliderPopupProp} />}
    </div>
  )
}

export const getIcon = (asset: Asset) => {
  if (asset.params.class == 'bank') {
  return <StreamlineEmojisDollarBanknote fontSize={80}/>
  }
  return <StreamlineEmojisMoneyBag fontSize={80}/>
}


const createOptions = (
  data: ChartData<"line">,
  onDragEnd: (index: number, val: number) => void,
): ChartOptions<'line'> => {
  const max = Math.max(...(data.datasets[0].data as number[]), 0)
  const min = Math.min(...(data.datasets[0].data as number[]), 0)
  return {
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
    scales: {
      yAxisL: {
        type: 'linear',
        suggestedMin: Math.min(min * 1.5, -200),
        suggestedMax: Math.max(max * 1.5, 200),
      },
      yAxisR: {
        type: 'linear',
        position: 'right',
        suggestedMin: 0,
      },
    },
    responsive: true,
    plugins: {
      // @ts-ignore
      dragData: {
        round: -1,
        showTooltip: true,
        onDragEnd: (e: any, datasetIndex: any, index: any, value: any) => {
          onDragEnd(index, value);
        },
      },
    }
  }
}

const createData = (asset: Asset): ChartData<'line'> => {
  const datasets: ChartDataset<'line'>[] = [{
    type: 'line' as const,
    yAxisID: 'yAxisL',
    label: `${asset.name}(増減)`,
    borderWidth: 1,
    fill: true,
    stepped: true,
    data: YEARS.map((y) => asset.cashFlows[y] || 0),
    pointHitRadius: 25,
    gradient: {
      backgroundColor: {
        axis: 'y',
        colors: {
          '-1': OUTCOME_COLOR_BG,
          0: INCOME_COLOR_BG,
        }
      },
      borderColor: {
        axis: 'y',
        colors: {
          '-1': OUTCOME_COLOR,
          0: INCOME_COLOR,
        }
      }
    },
  },
    {
      type: 'line' as const,
      yAxisID: 'yAxisR',
      label: `${asset.name}(残高)`,
      borderWidth: 1,
      stepped: false,
      data: YEARS.map((y) => asset.balances?.[y] || 0),
      pointStyle: false,
      fill: false,
      borderColor: ASSET_COLOR,
      backgroundColor: ASSET_COLOR_BG,
    }]
  return {
    labels: YEARS,
    datasets: datasets,
  }
}

