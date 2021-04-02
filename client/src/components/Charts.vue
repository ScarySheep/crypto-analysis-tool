<template>
  <div class="container-fluid">
    <h3 class="pt-3">{{ 'Ultimate Crypto Trading Bot' }}</h3>
    <div class="row binance-data mt-3">
      <div class="col-md-3">
        <div
          class="box shadow"
          v-bind:style="{ height: window.height * 0.4 + 'px' }"
        >
          <apexchart
            :options="chartOptionsCandle.pair0"
            :series="seriesCandle.pair0"
            height="100%"
          ></apexchart>
        </div>
      </div>
      <div class="col-md-3">
        <div
          class="box shadow"
          v-bind:style="{ height: window.height * 0.4 + 'px' }"
        >
          <apexchart
            :options="chartOptionsCandle.pair01"
            :series="seriesCandle.pair01"
            height="100%"
          ></apexchart>
        </div>
      </div>
      <div class="col-md-3">
        <div
          class="box shadow"
          v-bind:style="{ height: window.height * 0.4 + 'px' }"
        >
          <apexchart
            :options="chartOptionsCandle.pair1"
            :series="seriesCandle.pair1"
            height="100%"
          ></apexchart>
        </div>
      </div>
      <div class="col-md-3">
        <div
          class="box shadow"
          v-bind:style="{ height: window.height * 0.4 + 'px' }"
        >
          <h3 class="mb-4">{{ 'Parameters' }}</h3>
          <div class="row">
            <div class="col-md-7">
              <h6 class="float-right">Indicator threshold:</h6>
            </div>
            <div class="col-md-5">
              <h6 class="float-left">{{ indicatorThreshold }}</h6>
            </div>
          </div>
          <div class="row">
            <div class="col-md-7">
              <h6 class="float-right">Slope threshold:</h6>
            </div>
            <div class="col-md-5">
              <h6 class="float-left">{{ slopeThreshold }}</h6>
            </div>
          </div>
          <div class="row">
            <div class="col-md-7">
              <h6 class="float-right">CoD threshold:</h6>
            </div>
            <div class="col-md-5">
              <h6 class="float-left">{{ codThreshold }}</h6>
            </div>
          </div>
          <div class="row">
            <div class="col-md-7">
              <h6 class="float-right">Profit percentage:</h6>
            </div>
            <div class="col-md-5">
              <h6 class="float-left">{{ profitPercentage }}</h6>
            </div>
          </div>
          <div class="row">
            <div class="col-md-7">
              <h6 class="float-right">Return point percentage:</h6>
            </div>
            <div class="col-md-5">
              <h6 class="float-left">{{ returnPointPercentage }}</h6>
            </div>
          </div>
          <div class="row">
            <div class="col-md-7">
              <h6 class="float-right">Stop loss percentage:</h6>
            </div>
            <div class="col-md-5">
              <h6 class="float-left">{{ stopLossPercentage }}</h6>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row my-data mt-4">
      <div class="col-md-2">
        <div
          class="box shadow"
          v-bind:style="{ height: window.height * 0.4 + 'px' }"
        >
          <apexchart
            :options="chartOptionsIndicator"
            :series="seriesIndicator"
            height="100%"
          ></apexchart>
        </div>
      </div>

      <div class="col-md-2">
        <div
          class="box shadow"
          v-bind:style="{ height: window.height * 0.4 + 'px' }"
        >
          <apexchart
            :options="chartOptionsTrend.pair0"
            :series="seriesTrend.pair0"
            height="80%"
          ></apexchart>
          <h6 class="mt-2">Slope: {{ trendSlope.pair0 }}</h6>
          <h6>R2: {{ trendR2.pair0 }}</h6>
        </div>
      </div>

      <div class="col-md-2">
        <div
          class="box shadow"
          v-bind:style="{ height: window.height * 0.4 + 'px' }"
        >
          <apexchart
            :options="chartOptionsTrend.pair1"
            :series="seriesTrend.pair1"
            height="80%"
          ></apexchart>
          <h6 class="mt-2">Slope: {{ trendSlope.pair1 }}</h6>
          <h6>R2: {{ trendR2.pair1 }}</h6>
        </div>
      </div>

      <div class="col-md-3">
        <div
          class="box shadow"
          v-bind:style="{ height: window.height * 0.4 + 'px' }"
        ></div>
      </div>
      <div
        class="col-md-3"
        v-bind:style="{ height: window.height * 0.4 + 'px' }"
      >
        <div class="h-50 pb-2">
          <div class="box shadow h-100">
            <h3>{{ 'Control' }}</h3>
          </div>
        </div>
        <div class="h-50 pt-2">
          <div class="box shadow h-100">
            <h3>{{ 'Output' }}</h3>
          </div>
        </div>
      </div>
    </div>
    <footer class="footer p-2">
      <div class="container">
        <h6>{{ 'Copyright © 2021 James Lee' }}</h6>
      </div>
    </footer>
  </div>
</template>

<script>
import ChartInitService from '@/services/ChartInitService'
import CurrencyService from '@/services/CurrencyService'
import ParameterInitService from '@/services/ParameterInitService'
import Pusher from 'pusher-js'
import currencies from '@/currencies.js'

Pusher.logToConsole = false
const pusher = new Pusher('9682e615dcaf942c1961', {
  cluster: 'ap3',
  forceTLS: true
})
const channel = pusher.subscribe('charts')

export default {
  name: 'Charts',
  data () {
    return {
      window: {
        width: 0,
        height: 0
      },
      chartOptionsCandle: {
        pair0: {
          theme: {
            mode: 'dark'
          },
          chart: {
            type: 'candlestick',
            background: '#21252b',
            animations: {
              enabled: false
            }
          },
          plotOptions: {
            candlestick: {
              colors: {
                upward: '#98C379',
                downward: '#E06C75'
              }
            }
          },
          title: {
            text: 'b-chart-0',
            align: 'center'
          },
          xaxis: {
            type: 'datetime'
          },
          yaxis: {
            tooltip: {
              enabled: true
            }
          }
        },
        pair1: {
          theme: {
            mode: 'dark'
          },
          chart: {
            type: 'candlestick',
            background: '#21252b',
            animations: {
              enabled: false
            }
          },
          plotOptions: {
            candlestick: {
              colors: {
                upward: '#98C379',
                downward: '#E06C75'
              }
            }
          },
          title: {
            text: 'b-chart-1',
            align: 'center'
          },
          xaxis: {
            type: 'datetime'
          },
          yaxis: {
            tooltip: {
              enabled: true
            }
          }
        },
        pair01: {
          theme: {
            mode: 'dark'
          },
          chart: {
            type: 'candlestick',
            background: '#21252b',
            animations: {
              enabled: false
            }
          },
          plotOptions: {
            candlestick: {
              colors: {
                upward: '#98C379',
                downward: '#E06C75'
              }
            }
          },
          title: {
            text: 'b-chart-01',
            align: 'center'
          },
          xaxis: {
            type: 'datetime'
          },
          yaxis: {
            tooltip: {
              enabled: true
            }
          }
        }
      },
      seriesCandle: {
        pair0: [{ data: [] }],
        pair1: [{ data: [] }],
        pair01: [{ data: [] }]
      },
      chartOptionsIndicator: {
        theme: {
          mode: 'dark'
        },
        chart: {
          type: 'bar',
          background: '#21252b',
          animations: {
            enabled: false
          },
          toolbar: {
            show: false
          }
        },
        dataLabels: {
          enabled: false
        },
        title: {
          text: 'Indicator',
          align: 'center'
        },
        colors: [
          function ({ value, seriesIndex, w }) {
            if (value < 12) {
              return '#61afef'
            } else {
              return '#e06c75'
            }
          }
        ],
        yaxis: {
          labels: {
            show: false
          }
        },
        xaxis: {
          type: 'datetime'
        },
        stroke: {
          curve: 'stepline'
        }
      },
      seriesIndicator: [{ data: [] }],

      chartOptionsTrend: {
        pair0: {
          theme: {
            mode: 'dark'
          },
          chart: {
            type: 'line',
            background: '#21252b',
            toolbar: {
              show: false
            }
          },
          colors: ['#61afef'],
          fill: {
            type: 'solid'
          },
          markers: {
            size: [3, 0]
          },
          title: {
            text: 'Trend_0',
            align: 'center'
          },
          legend: {
            show: false
          },
          yaxis: {
            labels: {
              show: false
            }
          }
        },
        pair1: {
          theme: {
            mode: 'dark'
          },
          chart: {
            type: 'line',
            background: '#21252b',
            toolbar: {
              show: false
            }
          },
          colors: ['#61afef'],
          fill: {
            type: 'solid'
          },
          markers: {
            size: [3, 0]
          },
          title: {
            text: 'Trend_0',
            align: 'center'
          },
          legend: {
            show: false
          },
          yaxis: {
            labels: {
              show: false
            }
          }
        }
      },
      seriesTrend: {
        pair0: [{ data: [] }],
        pair1: [{ data: [] }]
      },
      trendSlope: [0, 0],
      trendR2: [0, 0],
      max: 0,
      min: 100,
      indicatorThreshold: 0,
      slopeThreshold: 1,
      codThreshold: 2,
      profitPercentage: 3,
      returnPointPercentage: 4,
      stopLossPercentage: 5
    }
  },
  created () {
    console.log('created')
    window.addEventListener('resize', this.handleResize)
    this.handleResize()
    this.init()
    this.updateCharts()
  },
  destroyed () {
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    handleResize () {
      this.window.width = window.innerWidth
      this.window.height = window.innerHeight
    },
    init () {
      this.getCurrencyData()
      this.getParameters()
      this.getInitData()
    },
    async getCurrencyData () {
      await CurrencyService.init()
      this.chartOptionsCandle.pair0 = {
        title: {
          text: currencies.data.pair0
        }
      }
      this.chartOptionsCandle.pair1 = {
        title: {
          text: currencies.data.pair1
        }
      }
      this.chartOptionsCandle.pair01 = {
        title: {
          text: currencies.data.pair01
        }
      }
      this.chartOptionsTrend.pair0 = {
        title: {
          text: currencies.data.pair0
        }
      }
      this.chartOptionsTrend.pair1 = {
        title: {
          text: currencies.data.pair1
        }
      }
    },
    async getParameters () {
      const res = await ParameterInitService.init()
      this.indicatorThreshold = res.data.indicatorThreshold
      this.slopeThreshold = res.data.slopeThreshold
      this.codThreshold = res.data.codThreshold
      this.profitPercentage = res.data.profitPercentage
      this.returnPointPercentage = res.data.returnPointPercentage
      this.stopLossPercentage = res.data.stopLossPercentage
    },
    async getInitData () {
      const res = await ChartInitService.init()
      let data = res.data
      if (data) {
        this.candleFormatAndUpdate(data)
      } else {
        setTimeout(() => {
          this.init()
        }, 3000)
      }
    },
    candleFormatting (data) {
      let results = []
      let base = Object.values(data)
      base.forEach((timeData, i) => {
        let currencyData = []
        let timeStamps = Object.keys(timeData)
        timeStamps.forEach((value, j) => {
          let values = Object.values(timeData[value])
          values.pop()
          values = values.map(Number)
          currencyData.push([parseInt(timeStamps[j]), values])
        })
        results.push(currencyData)
      })
      return results
    },
    candleFormatAndUpdate (data) {
      let formattedData = this.candleFormatting(data)
      this.seriesCandle.pair0 = [{
        data: formattedData[0]
      }]
      this.seriesCandle.pair1 = [{
        data: formattedData[1]
      }]
      this.seriesCandle.pair01 = [{
        data: formattedData[2]
      }]
    },
    trendCharts (data) {
      data.forEach((currency, index) => {
        let slopeData = []
        currency.data.forEach((value) => {
          // remove time
          delete value.time
          // make slope data
          slopeData.push({ x: value.x, y: (value.x * currency.slope + currency.intercept) })
        })
        let str = 'pair' + index
        this.trendSlope[str] = currency.slope.toFixed(2)
        this.trendR2[str] = currency.r2.toFixed(2)
        this.seriesTrend[str] = [{
          name: 'Points',
          type: 'scatter',
          data: currency.data
        }, {
          name: 'Line',
          type: 'line',
          data: slopeData
        }]
      })
    },
    updateCharts () {
      channel.bind('candlecharts', data => {
        this.candleFormatAndUpdate(data)
      })

      channel.bind('indicators', chartData => {
        chartData.forEach(element => {
          if (element[1] > this.max) this.max = element[1]
          if (element[1] < this.min) this.min = element[1]
          // format element
          element[1] = element[1].toFixed(2)
        })
        this.chartOptionsIndicator = {
          yaxis: {
            min: this.min * 0.3,
            max: this.max * 1.3
          }
        }
        this.seriesIndicator = [{
          data: chartData
        }]
      })

      channel.bind('trends', data => {
        this.trendCharts(data)
      })
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2,
h3,
h4,
h5,
h6 {
  color: azure;
}

.box {
  background-color: #21252b;
  padding: 15px 10px;
  border-radius: 10px;
}

.footer {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}

.nopadding {
  padding: 0 !important;
  margin: 0 !important;
}
</style>
