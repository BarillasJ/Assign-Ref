using Sabio.Data.Providers;
using Sabio.Models.Requests.ReplayEntries;
using Sabio.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Data;
using Sabio.Models.Domain.ReplayEntries;
using Sabio.Data;
using Sabio.Models.Domain.GameReports;
using Sabio.Models.Domain.Conferences;
using Google.Apis.AnalyticsReporting.v4.Data;
using Sabio.Models.Domain;
using Stripe.Terminal;
using sib_api_v3_sdk.Model;
using Sabio.Models.Domain.Teams;

namespace Sabio.Services
{
    public class ReplayEntryService : IReplayEntryService
    {
        IDataProvider _data = null;
        IBaseUserMapper _userMapper = null; 
        ILookUpService _lookUpService = null;
        IMapGameReport _mapGameReport = null;
        public ReplayEntryService(IDataProvider data, ILookUpService lookUpService, IBaseUserMapper userMapper, IMapGameReport mapGameReport )
        {
            _data = data;
            _userMapper = userMapper;
            _lookUpService = lookUpService;
            _mapGameReport = mapGameReport;
        }
        public List<ReplayEntry> GetByGameId(int id)
        {
            string procName = "[dbo].[Games_ReplayReport_ByGameId]";

            List<ReplayEntry> replayEntry = null;
      
           _data.ExecuteCmd(procName, delegate (SqlParameterCollection paramCol)
            {
                paramCol.AddWithValue("@GameId", id);

            }, singleRecordMapper: delegate (IDataReader reader, short set)
            {
                int startingIdx = 0;

              ReplayEntry aReplayEntry = MapSingleEntry(reader, ref startingIdx);

                if (replayEntry == null)
                {
                    replayEntry = new List<ReplayEntry>();
                }
                replayEntry.Add(aReplayEntry);
            }
            );
            return replayEntry;
        }
        public GameReplayDetails GetDetailed(int id)
        {
            GameReplayDetails replayEntry = null;

            string procName = "[dbo].[Games_ReplayReport_ByGameId_Detailed]";

            _data.ExecuteCmd(procName, delegate (SqlParameterCollection paramCol)
            {
                paramCol.AddWithValue("@GameId", id);

            }, delegate (IDataReader reader, short set)
            {
                replayEntry = MapDetialedReplayReport(reader);
            }
          );
            return replayEntry;
        }
        public int Add(ReplayEntryAddRequest model, int userId)
        {
            int id = 0;
            string procName = "[dbo].[ReplayEntries_Insert]";

            DataTable officialsIds = MapIdsToTable(model.RulingOfficialsIds);

            _data.ExecuteNonQuery(procName, inputParamMapper: delegate (SqlParameterCollection col)
            {
                AddCommonParams(model, col);
                col.AddWithValue("@CreatedBy", userId);
                col.AddWithValue("@RulingOfficialsIds", officialsIds);

                SqlParameter idOut = new SqlParameter("@Id", SqlDbType.Int);
                idOut.Direction = ParameterDirection.Output;
                col.Add(idOut);

            }, returnParameters: delegate (SqlParameterCollection returnCollection)
            {
                object oId = returnCollection["@Id"].Value;
                int.TryParse(oId.ToString(), out id);
            }
            );
            return id;
        }
        public void Update(ReplayEntryUpdateRequest model, int userId)
        {       
                string procName = "[dbo].[ReplayEntries_Update]";

                DataTable officialsIds = null;

                if (model.RulingOfficialsIds != null)
                {
                officialsIds = MapIdsToTable(model.RulingOfficialsIds);
                }

               _data.ExecuteNonQuery(procName, inputParamMapper: delegate (SqlParameterCollection col)
                {
                    AddCommonParams(model, col);
                    col.AddWithValue("@Id", model.Id);
                    col.AddWithValue("@ModifiedBy", userId);
                    col.AddWithValue("@RulingOfficialsIds", officialsIds);
                },
                    returnParameters: null);     
        }
        public void Delete(int id)
        {
            string procName = "[dbo].[ReplayEntries_Delete]";

            _data.ExecuteNonQuery(procName, inputParamMapper: delegate (SqlParameterCollection col)
            {

                col.AddWithValue("@Id", id);

            },
               returnParameters: null);
        }
        private static DataTable MapIdsToTable(List<int> rulingOfficialsIds)
        {
            DataTable dt = new DataTable();

            if (rulingOfficialsIds != null)
            {
                dt.Columns.Add("Id", typeof(Int32));

                foreach (int id in rulingOfficialsIds)
                {
                    DataRow dr = dt.NewRow();

                    dr = dt.NewRow();

                    dr.SetField(0, id);

                    dt.Rows.Add(dr);
                }
            }
            return dt;
        }
        private ReplayEntry MapSingleEntry(IDataReader reader, ref int startingIdx)
        {
            ReplayEntry replayEntry = new ReplayEntry();
          
            replayEntry.Id = reader.GetSafeInt32(startingIdx++);
            replayEntry.GameId = reader.GetSafeInt32(startingIdx++);
            replayEntry.GameReportId = reader.GetSafeInt32(startingIdx++);
            replayEntry.EntryType = _lookUpService.MapSingleLookUp(reader, ref startingIdx);
            replayEntry.Period = _lookUpService.MapSingleLookUp(reader, ref startingIdx);
            replayEntry.Time = reader.GetSafeTimeSpan(startingIdx++);
            replayEntry.ReviewTime = reader.GetSafeTimeSpan(startingIdx++);
            replayEntry.TotalTime = reader.GetSafeTimeSpan(startingIdx++);
            replayEntry.PossessionTeam = new BaseTeam();
            replayEntry.PossessionTeam.Id = reader.GetSafeInt32(startingIdx++);
            replayEntry.PossessionTeam.Name = reader.GetSafeString(startingIdx++);
            replayEntry.PossessionTeam.Code = reader.GetSafeString(startingIdx++);
            replayEntry.PossessionTeam.Logo = reader.GetSafeString(startingIdx++);         
            replayEntry.PlayType = _lookUpService.MapSingleLookUp(reader, ref startingIdx);
            replayEntry.Down = reader.GetSafeInt32(startingIdx++);
            replayEntry.Distance = reader.GetSafeInt32(startingIdx++);
            replayEntry.YTG = reader.GetSafeInt32(startingIdx++);
            replayEntry.VideoPlayNumber = reader.GetSafeInt32(startingIdx++);
            replayEntry.ROF = reader.GetSafeString(startingIdx++);
            replayEntry.Comments = reader.GetSafeString(startingIdx++);
            replayEntry.ReplayReason = _lookUpService.MapSingleLookUp(reader, ref startingIdx);
            replayEntry.IsChallenge = reader.GetSafeBool(startingIdx++);
            replayEntry.ChallengeTeam = new BaseTeam();
            replayEntry.ChallengeTeam.Id = reader.GetSafeInt32(startingIdx++);
            replayEntry.ChallengeTeam.Name = reader.GetSafeString(startingIdx++);
            replayEntry.ChallengeTeam.Code = reader.GetSafeString(startingIdx++);
            replayEntry.ChallengeTeam.Logo = reader.GetSafeString(startingIdx++);
            replayEntry.ReplayResult = _lookUpService.MapSingleLookUp(reader, ref startingIdx);
            replayEntry.TVTO = reader.GetSafeBool(startingIdx++);
            replayEntry.DateCreated = reader.GetSafeDateTime(startingIdx++);
            replayEntry.DateModified = reader.GetSafeDateTime(startingIdx++);
            replayEntry.CreatedBy = reader.GetSafeInt32(startingIdx++);
            replayEntry.ModifiedBy = reader.GetSafeInt32(startingIdx++);
            replayEntry.RulingOfficials = reader.DeserializeObject<List<string>>(startingIdx++);

            return replayEntry;
        }
        private GameReplayDetails MapDetialedReplayReport(IDataReader reader)
        {
            GameReplayDetails entry = new GameReplayDetails();

            int startingIdx = 0;
        
            entry.GameReport = _mapGameReport.MapSingleGameReport(reader, ref startingIdx);

            entry.ReplayEntries = reader.DeserializeObject <List<ReplayEntry>>(startingIdx++);

            entry.Assignments = reader.DeserializeObject<List<Assignment>>(startingIdx++);  

            return entry;
        }
        public static void AddCommonParams(ReplayEntryAddRequest model, SqlParameterCollection col)
        {
            col.AddWithValue("@GameReportId", model.GameReportId);
            col.AddWithValue("@EntryTypeId", model.EntryTypeId);
            col.AddWithValue("@PeriodId", model.PeriodId);
            col.AddWithValue("@Time", model.Time);
            col.AddWithValue("@ReviewTime", model.ReviewTime);
            col.AddWithValue("@TotalTime", model.TotalTime);
            col.AddWithValue("@PossessionTeamId", model.PossessionTeamId);
            col.AddWithValue("@PlayTypeId", model.PlayTypeId);
            col.AddWithValue("@Down", model.Down);
            col.AddWithValue("@Distance", model.Distance);
            col.AddWithValue("@YTG", model.YTG);
            col.AddWithValue("@VideoPlayNumber", model.VideoPlayNumber);
            col.AddWithValue("@ROF", model.ROF);
            col.AddWithValue("@Comment", model.Comment);
            col.AddWithValue("@ReplayReasonId", model.ReplayReasonId);
            col.AddWithValue("@IsChallenge", model.IsChallenge);
            col.AddWithValue("@ChallengeTeamId", model.ChallengeTeamId);
            col.AddWithValue("@ReplayResultId", model.ReplayResultId);
            col.AddWithValue("@TVTO", model.TVTO);
        }
    }
}
