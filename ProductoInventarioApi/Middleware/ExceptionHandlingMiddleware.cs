using ProductoInventarioApi.DTOs.General;
using ProductoInventarioApi.Middleware.Exceptions;
using System.Net;
using System.Text.Json;

namespace ProductoInventarioApi.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext httpContext)
        {
            try
            {
                await _next(httpContext);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(httpContext, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var response = new ApiResponse<object>
            {
                Data = null
            };

            switch (exception)
            {
                case UnauthorizedException:
                    context.Response.StatusCode = (int)HttpStatusCode.Unauthorized; // 401
                    response.Code = 401;
                    response.Message = exception.Message;
                    _logger.LogWarning("Unauthorized access attempt: {Message}", exception.Message);
                    break;
                case ArgumentException: 
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest; // 400
                    response.Code = 400;
                    response.Message = exception.Message;
                    _logger.LogWarning("Bad request: {Message}", exception.Message);
                    break;
                default:
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError; // 500
                    response.Code = 500;
                    response.Message = "Ocurrió un error inesperado.";
                    _logger.LogError(exception, "Error no manejado (500) | Request Path: {Path}", context.Request.Path);
                    break;
            }

            var jsonResponse = JsonSerializer.Serialize(response);
            await context.Response.WriteAsync(jsonResponse);
        }
    }
}
