using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Sabio.Models.Domain;
using Sabio.Models.Domain.GameReports;
using Sabio.Models.Domain.ReplayEntries;
using Sabio.Models.Requests.ReplayEntries;
using Sabio.Services;
using Sabio.Services.Interfaces;
using Sabio.Web.Controllers;
using Sabio.Web.Models.Responses;
using System;
using System.Collections.Generic;

namespace Sabio.Web.Api.Controllers
{
    [Route("api/replay/entries")]
    [ApiController]
    public class ReplayEntryApiController : BaseApiController
    {
        private IReplayEntryService _service = null;
        private IAuthenticationService<int> _authService = null;
        public ReplayEntryApiController(IReplayEntryService service, ILogger<ReplayEntryApiController> logger, IAuthenticationService<int> authService) : base(logger)
        {
            _service = service;
            _authService = authService;
        } 

        [HttpGet("games/{id:int}")]
        public ActionResult<ItemResponse<ReplayEntry>> GetById(int id)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                List<ReplayEntry> replayEntry = _service.GetByGameId(id);
                if (replayEntry == null)
                {
                    code = 404;
                    response = new ErrorResponse("Data Not Found");
                }
                else
                {
                    response = new ItemResponse<List<ReplayEntry>> { Item = replayEntry };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                base.Logger.LogError(ex.ToString());
                response = new ErrorResponse($"Generic Error: {ex.Message}");
            }
            return StatusCode(code, response);
        }

        [HttpGet("detailed/games/{id:int}")]
        public ActionResult<ItemResponse<GameReplayDetails>>GetReplayByGameId(int id)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                GameReplayDetails detailedReport = _service.GetDetailed(id);

                if (detailedReport == null)
                {
                    code = 404;
                    response = new ErrorResponse("Resource not found");
                }
                else
                {
                    response = new ItemResponse<GameReplayDetails> { Item = detailedReport };
                }
            }
            catch (Exception ex)
            {
                code = 500;
                base.Logger.LogError(ex.ToString());
                response = new ErrorResponse(ex.Message);
            }
            return StatusCode(code, response);
        }

        [HttpPost]
        public ActionResult<ItemResponse<int>> Create(ReplayEntryAddRequest model)
        {
            ObjectResult result = null;
            try
            {
                int userId = _authService.GetCurrentUserId();
                int id = _service.Add(model, userId);
                ItemResponse<int> response = new ItemResponse<int> { Item = id };

                result = Created201(response);
            }
            catch (Exception ex)
            {
                base.Logger.LogError(ex.ToString());
                ErrorResponse response = new ErrorResponse(ex.Message);

                result = StatusCode(500, response);
            }
            return result;
        }

        [HttpPut("{id:int}")]
        public ActionResult<SuccessResponse> Update(ReplayEntryUpdateRequest model)
        {
            int userId = _authService.GetCurrentUserId();
            int code = 200;
            BaseResponse response = null;
            try
            {
                _service.Update(model, userId);

                response = new SuccessResponse();
            }
            catch (Exception ex)
            {
                base.Logger.LogError(ex.ToString());
                code = 500;
                response = new ErrorResponse(ex.Message);
            }
            return StatusCode(code, response);
        }

        [HttpDelete("{id:int}")]
        public ActionResult<SuccessResponse> Delete(int id)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                _service.Delete(id);

                response = new SuccessResponse();
            }
            catch (Exception ex)
            {
                code = 500;
                response = new ErrorResponse(ex.Message);
            }
            return StatusCode(code, response);
        }

    }
}
