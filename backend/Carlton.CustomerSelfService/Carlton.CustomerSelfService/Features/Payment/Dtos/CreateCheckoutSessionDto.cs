namespace Carlton.CustomerSelfService.Features.Payment.Dtos;

public record CreateCheckoutSessionDto(
    string PlanTitle,
    decimal Amount,
    string SuccessUrl,
    string CancelUrl,
    int? LeisurePlanId = null
);
