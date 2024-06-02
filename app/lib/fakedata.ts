import { ChartData } from "chart.js";

const generateData = (length: number) => {
  const data = [];
  for (let i = 0; i < length; i++) {
    data.push(Math.floor(Math.random() * 100));
  }
  return data;
};

const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const generateColor = () => {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgba(${r}, ${g}, ${b}, 1)`;
};

const generateBorderColor = () => [generateColor()];

const NB_DATASETS = 4;

const generateDatasets = () => {
  const datasets = [];
  for (let i = 0; i < NB_DATASETS; i++) {
    const color = generateBorderColor();
    datasets.push({
      data: generateData(labels.length),
      borderColor: color,
      borderWidth: 3,
      pointBorderColor: "rgba(0, 0, 0, 0)",
      pointBackgroundColor: "rgba(0, 0, 0, 0)",
      pointHoverBackgroundColor: color,
      pointHoverRadius: 5,
    });
  }
  return datasets;
};

export const FAKE_DATA: ChartData<"line"> = {
  labels,
  datasets: generateDatasets(),
};