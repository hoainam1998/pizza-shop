function getRandomRgbColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  return `rgb(${r}, ${g}, ${b})`;
}

const data = {
  labels: ['product 1', 'product 2', 'product 3', 'product 4', 'product 5', 'product 6', 'product 7'],
  datasets: [{
    data: [65, 59, 80, 81, 56, 55, 40],
    backgroundColor: [
      getRandomRgbColor(),
      getRandomRgbColor(),
      getRandomRgbColor(),
      getRandomRgbColor(),
      getRandomRgbColor(),
      getRandomRgbColor(),
      getRandomRgbColor()
    ],
  }],
};

const config = {
  type: 'bar',
  data,
  options: {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      }
    },
    scales: {
      y: {
        title: {
          text: 'Number of purchases',
          display: true,
        },
      }
    }
  }
};

export default config;
