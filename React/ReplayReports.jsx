import React from "react";
import debug from "assignRef-debug";
const logger = debug.extend("ReplayReports");
import PropTypes from "prop-types";
import "./gamereplayreport.css";
import {CgMoreVertical, CgMoreVerticalAlt} from "react-icons/cg";
import {Collapse} from "reactstrap";
import Select from "react-select";

function ReplayReports(props) {
  const replay = props?.entry;
  logger(props);
  const gradeData = props?.gradeData;
  const challenge = replay?.isChallenge === true ? "Yes" : "No";
  const isTv = replay?.isTvto === true ? "Yes" : "No";
  const down =
    replay.down === 1
      ? replay.down + "st"
      : replay.down === 2
      ? replay.down + "nd"
      : replay.down === 3
      ? replay.down + "rd"
      : replay.down === 4
      ? replay.down + "th"
      : "-";
  const distance = replay.distance || "-";
  const ytg = replay.ytg || "-";
  const downDistanceYtg = `${down} / ${distance} / ${ytg}`;
  const timeVlaue = replay.time === "00:00:00" ? "-" : replay.time.slice(3, 8);
  const reviewTime =
    replay.reviewTime === "00:00:00" ? "-" : replay.reviewTime.slice(3, 8);
  const totalTime =
    replay.totalTime === "00:00:00" ? "-" : replay.totalTime.slice(3, 8);

  const officialArr = props.officials.filter((official) => {
    const matchedOff = replay?.rulingOfficials?.includes(
      official.position.code
    );
    return matchedOff;
  });

  const gradeMatch = props.gradeData.find(
    (grade) => grade.id === props.gradeInput[replay.id]
  );

  const gradeCell = gradeMatch?.code || "";

  const officialObj = officialArr.map((item) => {
    return (
      <li key={item.id} className="list-group-item custom-list-li border-0">
        <img
          src={item.user.avatarUrl}
          alt="Avatar"
          className="img-fluid avatar-md my-n2 h-auto"
        />{" "}
        {item.user.firstName} {item.user.lastName} - {item.position.code}
      </li>
    );
  });

  const onEditClick = (e) => {
    logger(e);
    props.onEditClick?.(replay, e);
  };

  const onDeleteClick = (e) => {
    logger(e);
    props.onDeleteClick?.(replay, e);
  };

  const handleChange = (selectedOption) => {
    const gradeTypeId = selectedOption ? selectedOption.value : 0;
    props.onGradeChange(replay.id, gradeTypeId, replay.comments);
    logger(gradeTypeId);
  };

  const options = [
    {value: "", label: "Select Grade"},
    ...gradeData
      .filter((grade) => grade.id > 10)
      .map((grade) => ({
        value: grade.id,
        label: grade.code,
        key: grade.id,
      })),
  ];

  const gradeValue = options.find(
    (option) => option.value === props.gradeInput[replay.id]
  );

  const viewGrades = props.currentUser.roles.includes(
    "Admin",
    "Assigner",
    "Grader",
    "Superivsor"
  );

  return (
    <React.Fragment>
      <tr
        key={replay.id}
        onClick={() => props.handleRowClick(replay.id)}
        className="align-middle border px-2 text-center row-hover">
        <td className="px-1 text-center p-4">{replay.period.name}</td>
        <td className="px-1 text-center">{timeVlaue}</td>
        <td className="px-1 text-center">{reviewTime}</td>
        <td className="px-1 text-center">{totalTime}</td>
        <td className="px-1 text-center">
          <img
            src={replay.possessionTeam.logo}
            alt="conf logo"
            className="img-fluid avatar-sm my-n3 h-auto"
          />{" "}
          {replay.possessionTeam.name}
        </td>
        <td className="px-1 text-center">{replay.playType.name}</td>
        <td className="px-1 text-center">{replay.replayReason.name}</td>
        <td className="px-1 text-center"> {challenge}</td>
        <td className="px-1 text-center">{isTv}</td>
        <td className="px-1 text-center">{props.entry.replayResult.name}</td>
        <td className="px-1 text-center">{props.entry.entryType.name}</td>
        {viewGrades && Object.keys(props.gradeInput).length > 0 && (
          <td className="px-2 text-center">{gradeCell}</td>
        )}
        <td className="px-1 text-center">
          {!props.isOpen ? (
            <CgMoreVerticalAlt className="fs-3" />
          ) : (
            <CgMoreVertical className="fs-3" />
          )}
        </td>
      </tr>
      <tr className="collapse-row-bg fs-5">
        <td colSpan={13} className="p-0">
          <Collapse isOpen={props.isOpen} unmountOnExit>
            <div className="row">
              <div className="col fs-3 collapse-row-titles text-center ms-8 mt-3 mb-0">
                Additional Details
                <div className="btn-toolbar float-end me-3">
                  <div className="btn-group text-center replay-report-form">
                    <i
                      title="Update Report"
                      className="fa fa-edit m-1 replay-table-icons"
                      onClick={onEditClick}></i>
                    <i
                      title="Delete Report"
                      className="fa fa-trash m-1 replay-table-icons"
                      onClick={onDeleteClick}></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="row m-3 fw-bold">
              <div className="col collapse-card d-flex">
                <div className="collapse-row-titles text-center">
                  Ruling Officials{" "}
                </div>
                <ul className="custom-list-ul">{officialObj}</ul>
              </div>
              <div className="col d-flex flex-column">
                <div className="col collapse-card">
                  <div className="text-center collapse-row-titles">
                    Challenge Team
                  </div>
                  <div className="row">
                    <div className="col pb-1">
                      {replay.challengeTeam && (
                        <img
                          src={replay?.challengeTeam?.logo || ""}
                          alt="Challenge Team Logo"
                          className="img-fluid avatar-md m-1 my-n2 h-auto"
                        />
                      )}{" "}
                      <span className="m-1">
                        {replay?.challengeTeam?.name || "No team challenge"}
                      </span>
                    </div>
                  </div>
                </div>
                <hr />
                <div className="col collapse-card">
                  <div className="text-center collapse-row-titles">
                    Down / Distance / Yard To Gain
                  </div>{" "}
                  <div className="card-text">{downDistanceYtg}</div>
                </div>
              </div>
              <div className="col collapse-card text-wrap">
                <div className="text-center collapse-row-titles">Comments </div>
                <p className="card-text">{replay.comments || "No comments"}</p>
              </div>
              <div className="col pe-0 d-flex flex-column">
                <div className="col collapse-card">
                  <div className="text-center collapse-row-titles">
                    Ruling On The Field
                  </div>
                  <p className="card-text text-wrap">{replay.rof}</p>
                </div>
                <hr />
                {viewGrades && (
                  <div className="col collapse-card">
                    <div className="fw-bold text-center collapse-row-titles">
                      Grade Report
                    </div>
                    <Select
                      className="m-1"
                      onChange={handleChange}
                      value={gradeValue || ""}
                      options={options}
                      menuPlacement="top"
                      isRequired
                      isClearable></Select>
                  </div>
                )}
              </div>
            </div>
          </Collapse>
        </td>
      </tr>
    </React.Fragment>
  );
}

export default ReplayReports;

ReplayReports.propTypes = {
  currentUser: PropTypes.shape({
    roles: PropTypes.arrayOf(PropTypes.string).isRequired,
  }),
  entry: PropTypes.shape({
    id: PropTypes.number.isRequired,
    period: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }),
    time: PropTypes.string.isRequired,
    reviewTime: PropTypes.string.isRequired,
    totalTime: PropTypes.string.isRequired,
    possessionTeam: PropTypes.shape({
      name: PropTypes.string.isRequired,
      logo: PropTypes.string.isRequired,
    }),
    playType: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }),
    replayReason: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }),
    isChallenge: PropTypes.bool.isRequired,
    isTvto: PropTypes.bool.isRequired,
    replayResult: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }),
    entryType: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }),
    challengeTeam: PropTypes.shape({
      name: PropTypes.string.isRequired,
      logo: PropTypes.string.isRequired,
    }),
    distance: PropTypes.number,
    down: PropTypes.number,
    ytg: PropTypes.number,
    videoPlayNumber: PropTypes.number,
    gameReportId: PropTypes.number,
    rulingOfficials: PropTypes.arrayOf(PropTypes.string),
    comments: PropTypes.string,
    rof: PropTypes.string,
  }),
  officials: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
    })
  ),
  gradeData: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string,
      isReplay: PropTypes.bool,
      id: PropTypes.number,
      name: PropTypes.string,
    }).isRequired
  ),
  onGradeChange: PropTypes.func.isRequired,
  gradeInput: PropTypes.shape({
    key: PropTypes.string,
  }),
  onEditClick: PropTypes.func,
  onDeleteClick: PropTypes.func,
  isOpen: PropTypes.bool,
  handleRowClick: PropTypes.func,
};
