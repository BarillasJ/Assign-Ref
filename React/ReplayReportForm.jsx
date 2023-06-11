import React, {useEffect, useCallback, useState, useRef} from "react";
import {useParams, Link} from "react-router-dom";
import debug from "sabio-debug";
const logger = debug.extend("ReplayReportForm");

import ReplayReports from "./ReplayReports";
import ReplayReportHeader from "./ReplayReportHeader";
import replayEntrySchema from "schemas/replayEntrySchema";

import gradeService from "services/gradeService";
import lookUpService from "services/lookUpService";
import replayEntryService from "services/replayentryservice";

import {
  Col,
  Container,
  InputGroup,
  Row,
  Nav,
  Table,
  Breadcrumb,
} from "react-bootstrap";
import {BsCheck2, BsCheck2All, BsXLg} from "react-icons/bs";
import {VscClearAll} from "react-icons/vsc";
import {Form, Formik, Field} from "formik";
import PropTypes from "prop-types";
import swal from "sweetalert2";
import toastr from "toastr";

import "./gamereplayreport.css";

function ReplayReportForm({currentUser}) {
  const formRef = useRef(null);
  const {gameId} = useParams();

  const viewGrades = currentUser.roles.includes(
    "Admin",
    "Assigner",
    "Grader",
    "Superivsor"
  );

  const initialFormData = {
    id: "",
    gameReportId: "",
    entryTypeId: "",
    periodId: "",
    timeMin: "",
    timeSec: "",
    reviewTimeMin: "",
    reviewTimeSec: "",
    totalTimeMin: "",
    totalTimeSec: "",
    possessionTeamId: "",
    playTypeId: "",
    down: "",
    distance: "",
    ytg: "",
    videoPlayNumber: "",
    rof: "",
    comment: "",
    replayReasonId: "",
    isChallenge: "",
    challengeTeamId: "",
    replayResultId: "",
    tvto: "",
    rulingOfficialsIds: [],
  };
  const [formData, setFormData] = useState(initialFormData);

  const [pageData, setPageData] = useState({
    formSuccessData: {},
    formMappedData: {},
    replaySuccessData: [],
    replayMappedData: [],
    editData: [],
    index: 1,
    pageSize: 10,
    gameId: gameId,
    activeTab: "Home",
    gradeData: [],
    replayGrades: [],
    gradeInput: {},
  });

  const [openRow, setOpenRow] = useState(null);

  const handleRowClick = (id) => {
    setOpenRow((prev) => (prev === id ? null : id));
  };

  const onGenericError = (error) => {
    logger("Information Not Found", error);
  };

  const updateActiveTab = (tabName) => {
    setPageData((prevState) => {
      if (prevState.activeTab === tabName) {
        return prevState;
      }
      return {...prevState, activeTab: tabName};
    });
  };

  useEffect(() => {
    let isReplay = "all";
    gradeService
      .lookUpGradeTypes(isReplay)
      .then(onGetGradesSuccess)
      .catch(onGenericError);

    setFormData({...initialFormData});
    lookUpService
      .lookUp([
        "PlayType",
        "Periods",
        "ReplayReasons",
        "ReplayResults",
        "EntryTypes",
      ])
      .then(onLookUpSuccess)
      .catch(onGenericError);

    lookUpService
      .lookUp3Col(["FieldPositions"])
      .then(onLookUp3Success)
      .catch(onGenericError);

    replayEntryService
      .detailedReplayByGameId(pageData.gameId)
      .then(onGetReplaySuccess)
      .catch(onGenericError);
  }, []);

  const onGetReplaySuccess = (response) => {
    setPageData((prevState) => {
      const tableData = {...prevState};
      tableData.formSuccessData.report = response.item;
      tableData.formSuccessData.teams = [
        response.item.gameReport.homeTeam,
        response.item.gameReport.visitingTeam,
      ];
      tableData.formMappedData.teams =
        tableData.formSuccessData.teams.map(mapToForm);

      tableData.replaySuccessData = response.item.replayEntries;
      if (tableData.replaySuccessData !== null) {
        tableData.replayMappedData = tableData.replaySuccessData;
      }
      return tableData;
    });
  };

  const onGradeChange = useCallback((replayEntryId, grade, comment) => {
    setPageData((prevState) => {
      const pd = {...prevState};
      let newGrade = {
        replayEntryId,
        gradeTypeId: grade,
        comment: comment,
      };
      const existingGrade = pd.replayGrades.findIndex(
        (replayGrades) => replayGrades.replayEntryId === replayEntryId
      );
      if (grade !== 0) {
        if (existingGrade !== -1) {
          pd.replayGrades[existingGrade] = newGrade;
        } else {
          pd.replayGrades.push(newGrade);
        }
      } else if (existingGrade !== -1) {
        pd.replayGrades.splice(existingGrade, 1);
      }
      if (pd.replayGrades.length === 0) {
        pd.gradeInput = {};
      } else {
        pd.gradeInput[replayEntryId] = grade;
      }
      return pd;
    });
  });

  const renderReplayEntries = () => {
    return pageData.replayMappedData.map((entry) => {
      const newEntry = {
        ...entry,
        isTvto: entry.tvto,
      };
      return (
        <ReplayReports
          key={entry.id}
          entry={newEntry}
          isOpen={openRow === entry.id}
          handleRowClick={handleRowClick}
          gradeInput={pageData.gradeInput}
          currentUser={currentUser}
          gradeData={pageData.gradeData}
          onGradeChange={onGradeChange}
          officials={pageData.formSuccessData.report.assignments}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
        />
      );
    });
  };

  const onGetGradesSuccess = (response) => {
    const newGradeData = response.data.items;
    setPageData((prevState) => ({
      ...prevState,
      gradeData: newGradeData,
    }));
  };

  const onLookUpSuccess = (response) => {
    setPageData((prevState) => {
      const foreignKey = {...prevState};

      foreignKey.formSuccessData.entryTypes = response.item.entryTypes;
      foreignKey.formMappedData.entryTypes =
        foreignKey.formSuccessData.entryTypes.map(mapToForm);

      foreignKey.formSuccessData.periods = response.item.periods;
      foreignKey.formMappedData.periods =
        foreignKey.formSuccessData.periods.map(mapToForm);

      foreignKey.formSuccessData.playType = response.item.playType;
      foreignKey.formMappedData.playType =
        foreignKey.formSuccessData.playType.map(mapToForm);

      foreignKey.formSuccessData.replayReasons = response.item.replayReasons;
      foreignKey.formMappedData.replayReasons =
        foreignKey.formSuccessData.replayReasons.map(mapToForm);

      foreignKey.formSuccessData.replayResults = response.item.replayResults;
      foreignKey.formMappedData.replayResults =
        foreignKey.formSuccessData.replayResults.map(mapToForm);

      return foreignKey;
    });
  };

  const onLookUp3Success = (response) => {
    setPageData((prevState) => {
      const foreignKey = {...prevState};
      foreignKey.formSuccessData.fieldPositions = response.items;
      foreignKey.formMappedData.fieldPositions =
        foreignKey.formSuccessData.fieldPositions;
      return foreignKey;
    });
  };

  const mapToForm = (item) => {
    if (item?.logo) {
      return (
        <option name={item.name} value={item.id} key={`team-${item.id}`}>
          {item.name}
        </option>
      );
    } else {
      return (
        <option name={item.name} value={item.id} key={`lookUp-${item.id}`}>
          {item.name}
        </option>
      );
    }
  };

  const handleOfficialsIds = (formikProps, id) => {
    const rulingOfficialsIds = formikProps.values.rulingOfficialsIds;
    const index = rulingOfficialsIds.indexOf(id);

    if (index === -1) {
      rulingOfficialsIds.push(id);
    } else {
      rulingOfficialsIds.splice(index, 1);
    }
    formikProps.setFieldValue("rulingOfficialsIds", rulingOfficialsIds);
  };

  const renderOfficials = (formikProps) => {
    return pageData.formMappedData.fieldPositions?.map(
      (item) =>
        item.id < 9 && (
          <span key={item.id} className="px-1 d-inline-flex m-1">
            <label htmlFor="rulingOfficialsIds" className="px-1">
              {item.code}:
            </label>
            <Field
              type="checkbox"
              className="form-check-input form-control my-auto"
              onChange={() => handleOfficialsIds(formikProps, item.id)}
              value={item.id}
              name="rulingOfficialsIds"
              checked={formikProps.values.rulingOfficialsIds.includes(item.id)}
            />
          </span>
        )
    );
  };

  const getTime = (min, sec) => {
    min = min ? min.toString().padStart(2, "0") : "00";
    sec = sec ? sec.toString().padStart(2, "0") : "00";

    if (`00:${min}:${sec}` === "00:00:00") {
      return null;
    }
    return `00:${min}:${sec}`;
  };

  const handleSubmit = (values) => {
    const time = getTime(values.timeMin, values.timeSec);
    const reviewTime = getTime(values.reviewTimeMin, values.reviewTimeSec);
    const totalTime = getTime(values.totalTimeMin, values.totalTimeSec);

    const newFormData = {
      id: values.id,
      gameReportId: pageData?.formSuccessData?.report?.gameReport.id,
      entryTypeId: parseInt(values.entryTypeId),
      periodId: parseInt(values.periodId),
      time: time,
      reviewTime: reviewTime,
      totalTime: totalTime,
      possessionTeamId: parseInt(values.possessionTeamId),
      playTypeId: parseInt(values.playTypeId),
      down: parseInt(values.down) || null,
      distance: parseInt(values.distance) || null,
      ytg: parseInt(values.ytg) || null,
      videoPlayNumber: parseInt(values.videoPlayNumber) || null,
      rof: values.rof,
      comment: values.comment || null,
      replayReasonId: parseInt(values.replayReasonId),
      isChallenge: values.isChallenge === "true" ? true : false,
      challengeTeamId: parseInt(values.challengeTeamId) || null,
      replayResultId: parseInt(values.replayResultId),
      tvto: values.tvto === "true" ? true : false,
      rulingOfficialsIds: values.rulingOfficialsIds,
    };

    if (values.id) {
      replayEntryService
        .updateReplayEntry(newFormData.id, newFormData)
        .then(onUpdateEntrySuccess)
        .catch(onGenericError);
    } else {
      replayEntryService
        .addReplayEntry(newFormData)
        .then(onAddEntrySuccess)
        .catch(onGenericError);
    }
  };

  const onAddEntrySuccess = (response) => {
    logger("Add Replay Entry Success --->", response);
    replayEntryService
      .detailedReplayByGameId(pageData.gameId)
      .then(onGetReplaySuccess);
    setFormData({...initialFormData});
    updateActiveTab("ReplayReports");
    toastr.success("Replay Entry Added!");
  };

  const onUpdateEntrySuccess = (response) => {
    logger("Update Replay Entry Success --->", response);
    replayEntryService
      .detailedReplayByGameId(pageData.gameId)
      .then(onGetReplaySuccess);
    setFormData({...initialFormData});
    updateActiveTab("ReplayReports");
    toastr.success("Replay Entry Updated!");
  };

  const onTimeInput = (e) => {
    e.target.value = e.target.value.slice(0, 2);
  };

  const yardageInput = (e) => {
    e.target.value = e.target.value.slice(0, 3);
  };

  function formValues(entry) {
    const timeMin =
      entry.time.slice(3, 5) === "00" ? "" : entry.time.slice(3, 5);
    const timeSec =
      entry.time.slice(6, 8) === "00" ? "" : entry.time.slice(6, 8);
    const reviewMin =
      entry.reviewTime.slice(3, 5) === "00" ? "" : entry.reviewTime.slice(3, 5);
    const reviewSec =
      entry.reviewTime.slice(6, 8) === "00" ? "" : entry.reviewTime.slice(6, 8);
    const totalMin =
      entry.totalTime.slice(3, 5) === "00" ? "" : entry.totalTime.slice(3, 5);
    const totalSec =
      entry.totalTime.slice(6, 8) === "00" ? "" : entry.totalTime.slice(6, 8);
    const getOfficials = entry.rulingOfficials.map((official) => {
      return pageData.formSuccessData.fieldPositions.find(
        (item) => item.code === official
      );
    });

    const rulingOfficialsIds = getOfficials.map((officials) => {
      return officials.id;
    });

    setFormData((prevState) => {
      let newFormData = {...prevState};
      newFormData = {
        id: entry.id,
        periodId: entry.period.id,
        timeMin: timeMin,
        timeSec: timeSec,
        reviewTimeMin: reviewMin,
        reviewTimeSec: reviewSec,
        totalTimeMin: totalMin,
        totalTimeSec: totalSec,
        possessionTeamId: entry.possessionTeam.id,
        playTypeId: entry.playType.id,
        replayReasonId: entry.replayReason.id,
        isChallenge: entry.isChallenge,
        tvto: entry.tvto,
        replayResultId: entry.replayResult.id,
        entryTypeId: entry.entryType.id,
        challengeTeamId: entry.challengeTeam?.id || "",
        distance: entry.distance || "",
        down: entry.down || "",
        ytg: entry.ytg || "",
        videoPlayNumber: entry.videoPlayNumber || "",
        gameReportId: entry.gameReportId,
        comment: entry.comments || "",
        rof: entry.rof,
        rulingOfficialsIds: rulingOfficialsIds,
      };
      return newFormData;
    });
  }

  const onCancelClick = () => {
    swal
      .fire({
        title: "Are you sure?",
        text: "This will clear all fields",
        icon: "warning",
        iconColor: "#ffaa46",
        cancelButtonText: "No, Continue Update",
        confirmButtonText: "Yes, Cancel Update",
        confirmButtonColor: "#ffaa46",
        showCancelButton: true,
        showConfirmButton: true,
        reverseButtons: true,
        allowOutsideClick: false,
        dangerMode: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          setFormData({...initialFormData});
          updateActiveTab("ReplayReports");
          swal.fire({
            timer: 1000,
            icon: "info",
            showConfirmButton: false,
            text: "Update Canceled",
          });
        }
      });
  };

  const onEditClick = useCallback((entry) => {
    swal
      .fire({
        title: `Update Entry # ${entry.id}?`,
        icon: "info",
        iconColor: "#29baf9",
        cancelButtonText: "No",
        confirmButtonText: "Yes, Update",
        confirmButtonColor: "#29baf9",
        showCancelButton: true,
        showConfirmButton: true,
        reverseButtons: true,
        allowOutsideClick: false,
        dangerMode: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          updateActiveTab("Home");
          formValues(entry);
        }
      });
  });

  const onDeleteClick = useCallback((entry) => {
    swal
      .fire({
        title: `Delete Entry # ${entry.id} ?`,
        text: "Warning: This action is irreversible. Are you sure you want to proceed?",
        icon: "warning",
        iconColor: "red",
        cancelButtonText: "No",
        confirmButtonText: "Proceed",
        confirmButtonColor: "#D32F2F",
        showCancelButton: true,
        showConfirmButton: true,
        reverseButtons: true,
        allowOutsideClick: false,
        dangerMode: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          const handler = getDeleteSuccessHandler(entry.id);
          replayEntryService
            .deleteEntry(entry.id)
            .then(handler)
            .catch(onGenericError);
        }
      });
  });

  const getDeleteSuccessHandler = (idToDelete) => {
    return () => {
      setPageData((prevState) => {
        const entries = {...prevState};
        entries.replaySuccessData = [...entries.replaySuccessData];

        const idxOf = entries.replaySuccessData.findIndex(
          (entry) => entry.id === idToDelete
        );
        if (idxOf >= 0) {
          entries.replaySuccessData.splice(idxOf, 1);
          entries.replayMappedData = entries.replaySuccessData;
        }
        return entries;
      });
      swal.fire({
        timer: 1200,
        icon: "info",
        showConfirmButton: false,
        text: `Report # ${idToDelete} has been deleted`,
      });
    };
  };

  const replayFormErrors = (errors, touched) => {
    const touchedErrors = {};

    Object.keys(touched).forEach((fieldName) => {
      if (errors[fieldName]) {
        touchedErrors[fieldName] = errors[fieldName];
      }
    });
    if (Object.keys(touchedErrors).length > 0) {
      return (
        <p className="text-center my-5">
          Fields with <span className="fs-4 text-danger">*</span> are required.
        </p>
      );
    }
    return null;
  };

  const handleTabSelect = (tabName) => {
    const checkId = formRef?.current?.values?.id;

    if (tabName === "ReplayReports" && checkId) {
      swal
        .fire({
          title: "Are you sure?",
          text: "This will clear all fields",
          icon: "warning",
          iconColor: "#ffaa46",
          cancelButtonText: "No, Continue Update",
          confirmButtonText: "Yes, Cancel Update",
          confirmButtonColor: "#ffaa46",
          showCancelButton: true,
          showConfirmButton: true,
          reverseButtons: true,
          allowOutsideClick: false,
          dangerMode: true,
        })
        .then((result) => {
          if (result.isConfirmed) {
            setFormData({...initialFormData});
            updateActiveTab("ReplayReports");
            swal.fire({
              timer: 1000,
              icon: "info",
              showConfirmButton: false,
              text: "Update Canceled",
            });
          }
        });
    } else {
      setFormData({...initialFormData});
      updateActiveTab(tabName);
    }
  };

  const submitGrades = () => {
    let newGradeData = [...pageData.replayGrades];
    logger(newGradeData);
    gradeService
      .addReplayGrade(newGradeData)
      .then(onAddGradeSuccess)
      .catch(onGenericError);
  };

  const onAddGradeSuccess = (response) => {
    toastr.success("Grades were successfully added.");
    logger(response);
    setPageData((prevState) => {
      const pd = {...prevState};
      pd.replayGrades = [];
      pd.gradeInput = {};
      return pd;
    });
  };

  const clearGrades = () => {
    setPageData((prevState) => {
      const pd = {...prevState};
      pd.replayGrades = [];
      pd.gradeInput = {};
      return pd;
    });
  };

  const renderGradeIcon = () => {
    if (pageData.replayGrades.length === 1) {
      return (
        <div className="col">
          <BsXLg className="fs-4" title="Clear Grade" onClick={clearGrades} />{" "}
          <BsCheck2
            title="Submit Grade"
            className="grade-icon"
            onClick={submitGrades}
          />
        </div>
      );
    }
    if (pageData.replayGrades.length > 1) {
      return (
        <div className="col">
          <VscClearAll
            className="fs-4"
            title="Clear Grades"
            onClick={clearGrades}
          />{" "}
          <BsCheck2All
            title="Submit Grades"
            onClick={submitGrades}
            className="grade-icon"
          />
        </div>
      );
    } else {
      return "Grades";
    }
  };

  return (
    <React.Fragment>
      <div className="replay-report-form">
        <div className="border-bottom pb-4 mb-4 d-md-flex align-items-center justify-content-between">
          <div className="mb-3 mb-md-0">
            <h1 className="mb-1 h2 fw-bold">
              {pageData.activeTab === "Home"
                ? "Replay Entry Form"
                : "Replay Entries"}
            </h1>
            <Breadcrumb>
              <Breadcrumb.Item href="#">Dashboard</Breadcrumb.Item>
              <Breadcrumb.Item href="/games/reports">
                Game Reports
              </Breadcrumb.Item>
              <Breadcrumb.Item href="#">
                {pageData.activeTab === "Home"
                  ? "Replay Entry Form"
                  : "Replay Entries"}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div>
            <Link to="/games/reports" className="btn btn-sm btn-primary">
              Game Reports
            </Link>
          </div>
        </div>
        <ReplayReportHeader
          report={pageData?.formSuccessData?.report}></ReplayReportHeader>
        <Nav variant="pills" defaultActiveKey="Home" className="pt-4">
          <Nav.Item>
            <Nav.Link
              eventKey="Home"
              className="nav-active"
              active={pageData.activeTab === "Home"}
              onClick={() => handleTabSelect("Home")}>
              New Replay Entry
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="ReplayReports"
              className="nav-active mx-1"
              active={pageData.activeTab === "ReplayReports"}
              onClick={() => handleTabSelect("ReplayReports")}>
              Replay Entries
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <div>
          {pageData.activeTab === "Home" && (
            <div className="pt-3">
              <Container className="card shadow-lg mw-100 fw-bold">
                <Formik
                  innerRef={formRef}
                  enableReinitialize={true}
                  initialValues={formData}
                  validationSchema={replayEntrySchema}
                  onSubmit={handleSubmit}>
                  {(formikProps) => (
                    <Form>
                      <Row
                        xs={2}
                        md={7}
                        lg={6}
                        className="pt-2 center-replay-form">
                        <Col xs={6} sm={6} md={2} lg={2} xl={1}>
                          <label className="table-font">Replay#</label>
                          <Field
                            type="text"
                            name="id"
                            readOnly="readOnly"
                            placeholder="0"
                            className="form-control field-set m-1 py-2 p-1"
                          />
                        </Col>
                        <Col md={4} lg={4} xl={2}>
                          <label className="table-font">Game Report#</label>
                          <Field
                            type="text"
                            name="gameReportId"
                            readOnly="readOnly"
                            className="form-control field-set  py-2 p-1"
                            value={
                              pageData?.formSuccessData?.report?.gameReport.id
                            }></Field>
                        </Col>

                        <Col md={4} lg={2}>
                          <label className="table-font">Time</label>
                          <div className="input-group py-1">
                            <InputGroup.Text className="field-set time-font p-1 py-2">
                              Min
                            </InputGroup.Text>
                            <Field
                              type="number"
                              min="0"
                              max="60"
                              name="timeMin"
                              onInput={onTimeInput}
                              className="number-arrows field-set form-control p-1 py-2"
                            />
                            <InputGroup.Text className="field-set time-font p-1 py-2">
                              Sec
                            </InputGroup.Text>
                            <Field
                              type="number"
                              min="0"
                              max="60"
                              name="timeSec"
                              onInput={onTimeInput}
                              className="number-arrows field-set form-control p-1 py-2"
                            />
                          </div>
                        </Col>
                        <Col md={4} lg={2}>
                          <label className="table-font">Review Time</label>
                          <div className="input-group py-1 d-flex">
                            <InputGroup.Text className="field-set time-font p-1 py-2">
                              Min
                            </InputGroup.Text>
                            <Field
                              type="number"
                              min="0"
                              max="60"
                              name="reviewTimeMin"
                              onInput={onTimeInput}
                              className="number-arrows field-set form-control p-1 py-2"
                            />
                            <InputGroup.Text className="field-set time-font p-1 py-2">
                              Sec
                            </InputGroup.Text>
                            <Field
                              type="number"
                              min="0"
                              max="60"
                              name="reviewTimeSec"
                              onInput={onTimeInput}
                              className="number-arrows field-set form-control p-1 py-2"
                            />
                          </div>
                        </Col>
                        <Col md={4} lg={2}>
                          <label className="table-font">Total Time</label>
                          <div className="input-group py-1">
                            <InputGroup.Text className="field-set time-font p-1 py-2">
                              Min
                            </InputGroup.Text>
                            <Field
                              type="number"
                              min="0"
                              max="60"
                              name="totalTimeMin"
                              onInput={onTimeInput}
                              className="number-arrows field-set form-control p-1 py-2"
                            />
                            <InputGroup.Text className="field-set time-font p-1 py-2">
                              Sec
                            </InputGroup.Text>
                            <Field
                              type="number"
                              min="0"
                              max="60"
                              name="totalTimeSec"
                              onInput={onTimeInput}
                              className="number-arrows field-set form-control p-1 py-2 "
                            />
                          </div>
                        </Col>
                        <Col md={4} lg={2}>
                          <label className="table-font">
                            Possession Team{" "}
                            {!formData.id &&
                              !formikProps.touched.possessionTeamId && (
                                <span className="fs-4 text-danger">*</span>
                              )}
                            {formikProps.errors.possessionTeamId &&
                              formikProps.touched.possessionTeamId && (
                                <span className="fs-4 text-danger">*</span>
                              )}
                          </label>
                          <Field
                            as="select"
                            name="possessionTeamId"
                            className="dropdown-arrow field-set form-control form-select m-1 py-2 p-1">
                            <option value="">Please Select One</option>
                            {pageData?.formMappedData?.teams}
                          </Field>
                        </Col>
                      </Row>
                      <hr />
                      <Row xs={2} md={3} lg={6} className="center-replay-form">
                        <Col xs={12} md={8} lg={3}>
                          <label className="table-font">
                            Replay Reason{" "}
                            {!formData.id &&
                              !formikProps.touched.replayReasonId && (
                                <span className="fs-4 text-danger">*</span>
                              )}
                            {formikProps.errors.replayReasonId &&
                              formikProps.touched.replayReasonId && (
                                <span className="fs-4 text-danger">*</span>
                              )}
                          </label>
                          <Field
                            as="select"
                            name="replayReasonId"
                            className="dropdown-arrow field-set form-control form-select m-1 py-2 p-1 select-dropdown">
                            <option value="">Please Select One</option>
                            {pageData?.formMappedData?.replayReasons}
                          </Field>
                        </Col>
                        <Col>
                          <label className="table-font">
                            Play Type{" "}
                            {!formData.id &&
                              !formikProps.touched.playTypeId && (
                                <span className="fs-4 text-danger">*</span>
                              )}
                            {formikProps.errors.playTypeId &&
                              formikProps.touched.playTypeId && (
                                <span className="fs-4 text-danger">*</span>
                              )}
                          </label>
                          <Field
                            as="select"
                            name="playTypeId"
                            className="dropdown-arrow field-set form-control form-select m-1 py-2 p-1">
                            <option value="">Please Select One</option>
                            {pageData?.formMappedData?.playType}
                          </Field>
                        </Col>
                        <Col>
                          <label className="table-font">
                            Coach Challenge{" "}
                            {!formData.id &&
                              !formikProps.touched.isChallenge && (
                                <span className="fs-4 text-danger">*</span>
                              )}
                            {formikProps.errors.isChallenge &&
                              formikProps.touched.isChallenge && (
                                <span className="fs-4 text-danger">*</span>
                              )}
                          </label>
                          <Field
                            as="select"
                            name="isChallenge"
                            className="dropdown-arrow field-set form-control form-select m-1 py-2 p-1">
                            <option value="">Please Select One</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </Field>
                        </Col>
                        <Col>
                          <label className="table-font">
                            TVTO{" "}
                            {!formData.id && !formikProps.touched.tvto && (
                              <span className="fs-4 text-danger">*</span>
                            )}
                            {formikProps.errors.tvto &&
                              formikProps.touched.tvto && (
                                <span className="fs-4 text-danger">*</span>
                              )}
                          </label>
                          <Field
                            as="select"
                            name="tvto"
                            className="dropdown-arrow field-set form-control form-select m-1 py-2 p-1">
                            <option value="">Please Select One</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </Field>
                        </Col>
                        <Col>
                          <label className="table-font">
                            Replay Result{" "}
                            {!formData.id &&
                              !formikProps.touched.replayResultId && (
                                <span className="fs-4 text-danger">*</span>
                              )}
                            {formikProps.errors.replayResultId &&
                              formikProps.touched.replayResultId && (
                                <span className="fs-4 text-danger">*</span>
                              )}
                          </label>
                          <Field
                            as="select"
                            name="replayResultId"
                            className="dropdown-arrow field-set form-control form-select m-1 py-2 p-1">
                            <option value="">Please Select One</option>
                            {pageData?.formMappedData?.replayResults}
                          </Field>
                        </Col>
                      </Row>
                      <hr />
                      <Row xs={2} md={3} lg={6} className="center-replay-form">
                        <Col xs={6}>
                          <label className="table-font">
                            QTR{" "}
                            {!formData.id && !formikProps.touched.periodId && (
                              <span className="fs-4 text-danger">*</span>
                            )}
                            {formikProps.errors.periodId &&
                              formikProps.touched.periodId && (
                                <span className="fs-4 text-danger">*</span>
                              )}
                          </label>
                          <Field
                            as="select"
                            name="periodId"
                            className="dropdown-arrow field-set form-control form-select m-1 py-2 p-1">
                            <option value="">Please Select One</option>
                            {pageData?.formMappedData?.periods}
                          </Field>
                        </Col>

                        <Col>
                          <label className="table-font">Challenge Team</label>
                          <Field
                            as="select"
                            name="challengeTeamId"
                            className="dropdown-arrow field-set form-control form-select m-1 py-2 p-1">
                            <option value="">Please Select One</option>
                            {pageData?.formMappedData?.teams}
                          </Field>
                        </Col>
                        <Col xs={4} md={2} lg={1}>
                          <label className="table-font">Distance</label>
                          <Field
                            type="number"
                            min="0"
                            max="100"
                            name="distance"
                            onInput={yardageInput}
                            className="number-arrows field-set form-control m-1 py-2 p-1"
                          />
                        </Col>

                        <Col xs={4} md={2} lg={1}>
                          <label className="table-font">YTG</label>
                          <Field
                            type="number"
                            min="0"
                            max="100"
                            name="ytg"
                            onInput={yardageInput}
                            className="number-arrows field-set form-control m-1 py-2 p-1"
                          />
                        </Col>
                        <Col xs={4} md={4} lg={2}>
                          <label className="table-font">Video Play#</label>
                          <Field
                            type="number"
                            name="videoPlayNumber"
                            className="number-arrows field-set form-control m-1 py-2 p-1"
                          />
                        </Col>
                        <Col xs={6} md={4} lg={2}>
                          <label className="table-font">Down</label>
                          <Field
                            as="select"
                            name="down"
                            className="dropdown-arrow field-set form-control form-select m-1 py-2 p-1">
                            <option value="">Please Select One</option>
                            <option value="1">1st</option>
                            <option value="2">2nd</option>
                            <option value="3">3rd</option>
                            <option value="4">4th</option>
                          </Field>
                        </Col>
                        <Col>
                          <label className="table-font">
                            Entry Type{" "}
                            {!formData.id &&
                              !formikProps.touched.entryTypeId && (
                                <span className="fs-4 text-danger">*</span>
                              )}
                            {formikProps.errors.entryTypeId &&
                              formikProps.touched.entryTypeId && (
                                <span className="fs-4 text-danger">*</span>
                              )}
                          </label>
                          <Field
                            as="select"
                            name="entryTypeId"
                            className="dropdown-arrow field-set form-control form-select m-1 py-2 p-1">
                            <option value="">Please Select One</option>
                            {pageData?.formMappedData?.entryTypes}
                          </Field>
                        </Col>
                      </Row>
                      <hr />
                      <Row>
                        <Col lg={7}>
                          <label className="table-font">
                            Ruling Officials:{" "}
                            {!formData.id &&
                              !formikProps.touched.rulingOfficialsIds && (
                                <span className="fs-4 text-danger">*</span>
                              )}
                            {formikProps.errors.rulingOfficialsIds &&
                              formikProps.touched.rulingOfficialsIds && (
                                <span className="fs-4 text-danger">*</span>
                              )}
                          </label>
                          <div>{renderOfficials(formikProps)}</div>
                        </Col>
                        <Col lg={5}>
                          <label className="table-font">
                            Ruling On The Field{" "}
                            {!formData.id && !formikProps.touched.rof && (
                              <span className="fs-4 text-danger">*</span>
                            )}
                            {formikProps.errors.rof &&
                              formikProps.touched.rof && (
                                <span className="fs-4 text-danger">*</span>
                              )}
                          </label>
                          <Field
                            as="textarea"
                            name="rof"
                            maxLength="200"
                            placeholder="Ruling on the field"
                            className="text-box field-set w-75 form-control"
                          />
                        </Col>
                      </Row>
                      <hr />
                      <Row>
                        <Col lg={7}>
                          <label className="table-font">Comments</label>
                          <Field
                            as="textarea"
                            name="comment"
                            maxLength="1000"
                            placeholder="Comments"
                            className="text-box field-set form-control "
                          />
                        </Col>
                        <Col>
                          {replayFormErrors(
                            formikProps.errors,
                            formikProps.touched
                          )}
                        </Col>
                      </Row>

                      <hr />
                      <Row className="text-center">
                        <Col>
                          {formData.id && (
                            <button
                              className="btn btn-warning w-15 m-1 p-1"
                              type="button"
                              onClick={onCancelClick}>
                              Cancel Update
                            </button>
                          )}
                          {!formData.id && (
                            <button
                              type="submit"
                              className="btn btn-primary w-15 text-nowrap m-1 p-1">
                              submit
                            </button>
                          )}
                          {formData.id && (
                            <button
                              className="btn btn-primary w-15 text-nowrap m-1 p-1"
                              type="submit">
                              Update
                            </button>
                          )}
                        </Col>
                      </Row>
                    </Form>
                  )}
                </Formik>
              </Container>
            </div>
          )}
          <Row>
            {pageData.activeTab === "ReplayReports" && (
              <Col className="table-responsive overflow-y-hidden pt-5 table-layout-fixed">
                <Table
                  responsive
                  borderless
                  className="shadow-lg text-nowrap text-primary h5">
                  <thead className="border-bottom form-heading align-middle text-center">
                    <tr>
                      <th className="px-1">QTR</th>
                      <th className="px-1">Time</th>
                      <th className="px-1">Review Time</th>
                      <th className="px-1">Total Time</th>
                      <th className="px-1">Possession Team </th>
                      <th className="px-1">Play </th>
                      <th className="px-1">Reason</th>
                      <th className="px-1">Challenge</th>
                      <th className="px-1">TVTO</th>
                      <th className="px-1">Result</th>
                      <th className="px-1">Type</th>
                      {viewGrades && pageData.replayGrades.length > 0 && (
                        <th className="px-1">{renderGradeIcon()}</th>
                      )}
                      <th className="px-1">{}</th>
                    </tr>
                  </thead>
                  <tbody className="table-styling">
                    {renderReplayEntries()}
                    {pageData.replaySuccessData === null && (
                      <tr>
                        <th colSpan={14} className="fs-3 text-center">
                          No replay entries found
                        </th>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Col>
            )}
          </Row>
        </div>
      </div>
    </React.Fragment>
  );
}

export default ReplayReportForm;

ReplayReportForm.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.number.isRequired,
    isLoggedIn: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    roles: PropTypes.arrayOf(PropTypes.string).isRequired,
    conferenceId: PropTypes.number.isRequired,
  }),
};
