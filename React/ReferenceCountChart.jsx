import React, {useEffect, useState} from "react";
import ApexChart from "react-apexcharts";
import referenceCount from "../../../services/siteReferenceService";
import "./googleAnalytics.css";
import debug from "assignRef-debug";
const _logger = debug.extend("ReferenceCount");
import {Card, Col, Spinner} from "react-bootstrap";

function ReferenceCountChart() {
  const [series, setSeries] = useState([]);
  const [options, setOptions] = useState({
    legend: {
      show: true,
      markers: {
        width: 12,
        height: 12,
        strokeWidth: 0,
        radius: 6,
        hover: {
          size: 8,
        },
      },
      itemMargin: {
        horizontal: 5,
        vertical: 5,
      },
      formatter: function (val, opts) {
        const index = opts.seriesIndex;
        return `${val}: ${percent[index]}%`;
      },
    },
    title: {
      text: "Site References",
      align: "center",
    },
    dataLabels: {
      enabled: true,
      enabledOnSeries: undefined,
      textAnchor: "bottom",
      distributed: true,

      verticalAlign: "bottom",
      style: {
        fontSize: "10px",
        fontFamily: "Helvetica, Arial, sans-serif",
        fontWeight: "bold",
      },
    },
    labels: [],
    colors: ["#33b2df", "#546E7A", "#d4526e", "#13d8aa", "#A5978B", "#2b908f"],
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
          },
        },
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 250,
          },
        },
      },
    ],
    tooltip: {
      enabled: false,
    },
  });

  useEffect(() => {
    referenceCount
      .getReferenceCount()
      .then(onGetCountSuccess)
      .catch(onGetCountError);
  }, []);

  const onGetCountSuccess = (response) => {
    const labels = response.items.map((obj) => obj.reference);
    const series = response.items.map((obj) => obj.count);
    const sumValues = series.reduce((acc, cur) => acc + cur, 0);
    const percentValue = series.map((value) =>
      Math.round((value / sumValues) * 100)
    );

    setSeries(series);
    setOptions((prevOptions) => ({
      ...prevOptions,
      legend: {
        ...prevOptions.legend,
        formatter: function (val, opts) {
          const index = opts.seriesIndex;
          return `${val}: ${percentValue[index]}%`;
        },
      },
      labels: labels,
    }));
  };

  const onGetCountError = (error) => {
    _logger(error);
  };

  return (
    <Col xl={6} lg={4} md={12} className="mb-4 h-100">
      <Card className="h-100 shadow-lg border-dark">
        <Card.Body className="p-1 py-1">
          {series.length < 1 ? (
            <div className="d-flex align-items-center justify-content-center ga-sm-graph-ht">
              <Spinner className="ga-spinner-size" />
            </div>
          ) : (
            <div>
              <ApexChart
                className="mb-4 h-100 ga-sm-graph-ht"
                options={options}
                series={series}
                type="donut"
                height={300}
              />
            </div>
          )}
        </Card.Body>
      </Card>
    </Col>
  );
}

export default ReferenceCountChart;
