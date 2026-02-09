using AccountingService.Application.Commands.CreateAccount;
using AccountingService.Application.Commands.UpdateAccount;
using AccountingService.Application.DTOs;
using AccountingService.Application.Queries.GetAccount;
using AccountingService.Application.Queries.ListAccounts;
using AccountingService.Domain.Aggregates.AccountAggregate;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AccountingService.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<AccountsController> _logger;

    public AccountsController(IMediator mediator, ILogger<AccountsController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Create a new account
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(AccountDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateAccount([FromBody] CreateAccountCommand command)
    {
        var result = await _mediator.Send(command);

        return result.Match<IActionResult>(
            onSuccess: account => CreatedAtAction(nameof(GetAccount), new { id = account.Id }, account),
            onFailure: error => BadRequest(new ProblemDetails { Detail = error }));
    }

    /// <summary>
    /// Get account by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(AccountDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAccount(Guid id)
    {
        var result = await _mediator.Send(new GetAccountQuery(id));

        return result.Match<IActionResult>(
            onSuccess: account => Ok(account),
            onFailure: error => NotFound(new ProblemDetails { Detail = error }));
    }

    /// <summary>
    /// List accounts with optional filtering
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<AccountDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ListAccounts(
        [FromQuery] AccountType? type = null,
        [FromQuery] AccountStatus? status = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 50)
    {
        var result = await _mediator.Send(new ListAccountsQuery(type, status, pageNumber, pageSize));

        return result.Match<IActionResult>(
            onSuccess: accounts => Ok(accounts),
            onFailure: error => BadRequest(new ProblemDetails { Detail = error }));
    }

    /// <summary>
    /// Update an existing account
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(AccountDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAccount(Guid id, [FromBody] UpdateAccountCommand command)
    {
        // Ensure ID from route matches command
        if (id != command.Id)
        {
            return BadRequest(new ProblemDetails { Detail = "Route ID and command ID must match" });
        }

        var result = await _mediator.Send(command);

        return result.Match<IActionResult>(
            onSuccess: account => Ok(account),
            onFailure: error => NotFound(new ProblemDetails { Detail = error }));
    }
}
