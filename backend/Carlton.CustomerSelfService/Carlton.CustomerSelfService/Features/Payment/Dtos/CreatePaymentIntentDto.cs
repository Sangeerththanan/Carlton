namespace Carlton.CustomerSelfService.Features.Payment.Dtos;

public record CreatePaymentIntentDto(
    string PlanTitle,
    decimal Amount,
    int? LeisurePlanId = null
);
