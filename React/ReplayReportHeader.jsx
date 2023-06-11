import React from "react";
import * as dateFormater from "../../utils/dateFormater";
import PropTypes from "prop-types";
import {Accordion, Col, Row} from "react-bootstrap";
import "./gamereplayreport.css";

function ReplayReportHeader(props) {
  const report = props?.report?.gameReport;

  const tableObj = {
    id: report?.id || "",
    gameDate: dateFormater.formatDate(report?.startTime),
    gameId: report?.gameId || "",
    home: report?.homeTeam?.name || "",
    homeLogo: report?.homeTeam?.logo || "",
    visitors: report?.visitingTeam?.name || "",
    visitorLogo: report?.visitingTeam?.logo || "",
    starTime: dateFormater.formatTime(report?.startTime),
    endTime: dateFormater.formatTime(report?.endTime),
    totalTime: report?.totalTime || "",
    homeScore: report?.homeTeam?.score || "",
    visitorScore: report?.visitingTeam?.score || "",
    conferenceLogo: report?.conference?.logo || "",
    conferenceName: report?.conference?.name || "",
  };

  const getOfficial = (position) => {
    let result = "";
    const off = props?.report?.assignments?.filter(
      (official) => official.position.code === position
    );
    if (off && off.length > 0) {
      result = `${off[0].user.firstName} ${off[0].user.lastName}`;
    }
    return result;
  };

  return (
    <Row
      xs={1}
      md={1}
      xl={2}
      className="replay-report-form container-fluid p-0 header-row-spacing">
      <Col className="p-1">
        <Accordion defaultActiveKey="0">
          <Accordion.Item className="replay-report-form">
            <Accordion.Header className="dropdown-toggle-custom">
              <div className="w-100">
                <Row xs={1} sm={2} md={2} lg={2} xl={2}>
                  <Col>
                    <h3 className="float-start text-wrap">Game Report</h3>
                  </Col>
                  <Col className="pe-1 text-center">
                    <img
                      src={tableObj.visitorLogo}
                      alt="visitor logo"
                      className="img-fluid avatar-lg my-n3 h-auto"
                    />
                    <span className="mx-2 small fw-bold">AT</span>
                    <img
                      src={tableObj.homeLogo}
                      alt="home logo"
                      className="img-fluid avatar-lg my-n3 h-auto"
                    />
                  </Col>
                </Row>
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <Row xs={2} md={3} lg={2} xl={3}>
                <Col xs={4} md={4} xl={3} className="p-2">
                  <h5>Game #</h5>
                  <input
                    disabled
                    className="form-control fw-bold text-secondary p-2"
                    type="text"
                    value={tableObj.gameId}
                  />
                </Col>
                <Col xs={8} md={8} xl={5} className="p-2">
                  <h5>Game Date</h5>
                  <input
                    disabled
                    className="form-control fw-bold text-secondary p-2"
                    type="text"
                    value={tableObj.gameDate}
                  />
                </Col>
                <Col className="p-2">
                  <h5>Total Time</h5>
                  <input
                    disabled
                    className="form-control fw-bold text-secondary p-2"
                    type="text"
                    value={tableObj.totalTime}
                  />
                </Col>
                <Col className="p-2">
                  <h5>Start Time</h5>
                  <input
                    disabled
                    className="form-control fw-bold text-secondary p-2"
                    type="text"
                    value={tableObj.starTime}
                  />
                </Col>
                <Col className="p-2">
                  <h5>End Time</h5>
                  <input
                    disabled
                    className="form-control fw-bold text-secondary p-2"
                    type="text"
                    value={tableObj.endTime}
                  />
                </Col>
                <Col className=" p-2">
                  <h5>Play Count</h5>
                  <input
                    disabled
                    className="form-control fw-bold text-secondary p-2"
                    type="text"
                    value={"Play Count"}
                  />
                </Col>
                <Col className="p-2">
                  <h5>Home</h5>
                  <input
                    disabled
                    className="form-control fw-bold text-secondary p-2"
                    type="text"
                    value={tableObj.home}
                  />
                </Col>
                <Col xl={2} className="p-2">
                  <h5> Score</h5>
                  <input
                    disabled
                    className="form-control fw-bold text-secondary p-2"
                    type="text"
                    value={tableObj.homeScore}
                  />
                </Col>
                <Col className="p-2">
                  <h5>Visitors</h5>
                  <input
                    disabled
                    className="form-control fw-bold text-secondary p-2"
                    type="text"
                    value={tableObj.visitors}
                  />
                </Col>
                <Col xl={2} className=" p-2">
                  <h5>Score</h5>
                  <input
                    disabled
                    className="form-control fw-bold text-secondary p-2"
                    type="text"
                    value={tableObj.visitorScore}
                  />
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Col>
      <Col className="p-1">
        <Accordion defaultActiveKey="0">
          <Accordion.Item className="replay-report-form">
            {" "}
            <Accordion.Header className="dropdown-toggle-custom">
              {" "}
              <div className="w-100">
                <Row xs={1} sm={2} md={2} lg={2} xl={2}>
                  <Col>
                    <h3 className="float-start text-wrap"> Game Officials</h3>
                  </Col>
                  <Col>
                    <Col className="text-center">
                      <img
                        src={tableObj.conferenceLogo}
                        alt="conf logo"
                        className="img-fluid avatar-sm my-n2 h-auto "
                      />
                    </Col>
                  </Col>
                </Row>
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <Row xs={1} md={2} lg={2} xl={3} xxl={3}>
                <Col xs={12} md={12} xl={7} xxl={8} className="p-2">
                  <h5>Conference</h5>
                  <input
                    className="form-control fw-bold text-secondary p-2 text-wrap"
                    type="text"
                    value={tableObj.conferenceName}
                    disabled
                  />
                </Col>
                <Col xl={3} className="p-2">
                  <h5>Referee</h5>
                  <input
                    className="form-control fw-bold text-secondary p-2"
                    type="text"
                    value={getOfficial("R")}
                    disabled
                  />
                </Col>
                <Col xl={3} className="p-2">
                  <h5>Umpire</h5>
                  <input
                    className="form-control fw-bold text-secondary p-2"
                    type="text"
                    value={getOfficial("U")}
                    disabled
                  />
                </Col>
                <Col xl={3} className="p-2">
                  <h5>Head Line-Judge</h5>
                  <input
                    className="form-control fw-bold text-secondary p-2"
                    type="text"
                    value={getOfficial("H")}
                    disabled
                  />
                </Col>
                <Col xl={3} className="p-2">
                  <h5>Line Judge</h5>
                  <input
                    className="form-control fw-bold text-secondary p-2"
                    type="text"
                    value={getOfficial("L")}
                    disabled
                  />
                </Col>
                <Col xl={3} className=" p-2">
                  <h5>Side Judge</h5>
                  <input
                    className="form-control fw-bold text-secondary p-2"
                    type="text"
                    value={getOfficial("S")}
                    disabled
                  />
                </Col>
                <Col xl={3} className="p-2">
                  <h5>Field Judge</h5>
                  <input
                    className="form-control fw-bold text-secondary p-2"
                    type="text"
                    value={getOfficial("F")}
                    disabled
                  />
                </Col>
                <Col xl={3} className=" p-2">
                  <h5>Back Judge</h5>
                  <input
                    className="form-control fw-bold text-secondary p-2"
                    type="text"
                    value={getOfficial("B")}
                    disabled
                  />
                </Col>
                <Col xl={3} className="p-2">
                  <h5>Center Judge</h5>
                  <input
                    className="form-control fw-bold text-secondary p-2"
                    type="text"
                    value={getOfficial("C")}
                    disabled
                  />
                </Col>

                <Col xl={3} className=" p-2">
                  <h5>Replay Official</h5>
                  <input
                    className="form-control fw-bold text-secondary p-2"
                    type="text"
                    value={getOfficial("RO")}
                    disabled
                  />
                </Col>
                <Col xl={3} className=" p-2">
                  <h5 className="text-wrap">Replay Communicator </h5>
                  <input
                    className="form-control fw-bold text-secondary p-2"
                    type="text"
                    value={getOfficial("R2")}
                    disabled
                  />
                </Col>
                <Col xl={3} className=" p-2">
                  <h5>Alternate Official</h5>
                  <input
                    className="form-control fw-bold text-secondary p-2"
                    type="text"
                    value={getOfficial("AO")}
                    disabled
                  />
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Col>
    </Row>
  );
}
export default ReplayReportHeader;

ReplayReportHeader.propTypes = {
  report: PropTypes.shape({
    gameReport: PropTypes.shape({
      id: PropTypes.number,
      startTime: PropTypes.string.isRequired,
      endTime: PropTypes.string.isRequired,
      totalTime: PropTypes.string.isRequired,
      gameId: PropTypes.number.isRequired,
      homeTeam: PropTypes.shape({
        name: PropTypes.string.isRequired,
        score: PropTypes.number.isRequired,
        logo: PropTypes.string.isRequired,
      }).isRequired,
      visitingTeam: PropTypes.shape({
        name: PropTypes.string.isRequired,
        score: PropTypes.number.isRequired,
        logo: PropTypes.string.isRequired,
      }).isRequired,
    }),
    assignments: PropTypes.arrayOf(
      PropTypes.shape({
        position: PropTypes.shape({
          code: PropTypes.string.isRequired,
        }).isRequired,
        conference: PropTypes.shape({
          logo: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
        }),
        user: PropTypes.shape({
          firstName: PropTypes.string,
          lastName: PropTypes.string,
        }),
      })
    ),
  }),
};
