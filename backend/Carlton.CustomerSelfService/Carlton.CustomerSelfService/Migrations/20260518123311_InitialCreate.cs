using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Carlton.CustomerSelfService.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CarSearches",
                columns: table => new
                {
                    DeviceId = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    SearchId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    PickupLocation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ReturnLocation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    PickupDate = table.Column<DateTime>(type: "date", nullable: true),
                    ReturnDate = table.Column<DateTime>(type: "date", nullable: true),
                    PickupTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    ReturnTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    DifferentReturn = table.Column<bool>(type: "bit", nullable: false),
                    DriverAge30To65 = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CarSearches", x => new { x.DeviceId, x.SearchId });
                });

            migrationBuilder.CreateTable(
                name: "Countries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IsoCode = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DialCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    FlagUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Countries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    IsGuest = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FlightHotelSearches",
                columns: table => new
                {
                    DeviceId = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    SearchId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    FromLocation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ToLocation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    TripType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DepartureDate = table.Column<DateTime>(type: "date", nullable: true),
                    ReturnDate = table.Column<DateTime>(type: "date", nullable: true),
                    Adults = table.Column<int>(type: "int", nullable: false),
                    Children = table.Column<int>(type: "int", nullable: false),
                    Infants = table.Column<int>(type: "int", nullable: false),
                    Airlines = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    MealPreferences = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    DirectOnly = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FlightHotelSearches", x => new { x.DeviceId, x.SearchId });
                });

            migrationBuilder.CreateTable(
                name: "Flights",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FlightNumber = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Departure = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Destination = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DepartureTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ArrivalTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    SeatsAvailable = table.Column<int>(type: "int", nullable: false),
                    Airline = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Stops = table.Column<int>(type: "int", nullable: false),
                    HasCheckInBaggage = table.Column<bool>(type: "bit", nullable: false),
                    HasHandLuggage = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Flights", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FlightSearches",
                columns: table => new
                {
                    DeviceId = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    SearchId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    FromLocation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ToLocation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    TripType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DepartureDate = table.Column<DateTime>(type: "date", nullable: true),
                    ReturnDate = table.Column<DateTime>(type: "date", nullable: true),
                    Adults = table.Column<int>(type: "int", nullable: false),
                    Children = table.Column<int>(type: "int", nullable: false),
                    Infants = table.Column<int>(type: "int", nullable: false),
                    CabinClass = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Airlines = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    DirectOnly = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FlightSearches", x => new { x.DeviceId, x.SearchId });
                });

            migrationBuilder.CreateTable(
                name: "HotelSearches",
                columns: table => new
                {
                    DeviceId = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    SearchId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    Destination = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CheckInDate = table.Column<DateTime>(type: "date", nullable: true),
                    CheckOutDate = table.Column<DateTime>(type: "date", nullable: true),
                    Adults = table.Column<int>(type: "int", nullable: false),
                    Children = table.Column<int>(type: "int", nullable: false),
                    Infants = table.Column<int>(type: "int", nullable: false),
                    RoomsStandard = table.Column<int>(type: "int", nullable: false),
                    RoomsDeluxe = table.Column<int>(type: "int", nullable: false),
                    RoomsSuite = table.Column<int>(type: "int", nullable: false),
                    RoomsFamily = table.Column<int>(type: "int", nullable: false),
                    MealPreferences = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HotelSearches", x => new { x.DeviceId, x.SearchId });
                });

            migrationBuilder.CreateTable(
                name: "LeisurePackages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Destination = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Badge = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    BadgeColor = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Image = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Subtitle = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Nights = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    WasPrice = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Price = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PerLabel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Save = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeisurePackages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RefundOptionCatalogItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    PricePerPassenger = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Recommended = table.Column<bool>(type: "bit", nullable: false),
                    BulletsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefundOptionCatalogItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ServicePackageCatalogItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PricePerPassenger = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    TopChoice = table.Column<bool>(type: "bit", nullable: false),
                    FeaturesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServicePackageCatalogItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Airlines",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IataCode = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    LogoUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CountryId = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Airlines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Airlines_Countries_CountryId",
                        column: x => x.CountryId,
                        principalTable: "Countries",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "CustomerLoyaltyAccounts",
                columns: table => new
                {
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    LoyaltyPoints = table.Column<int>(type: "int", nullable: false),
                    TierLevel = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    MemberSinceDate = table.Column<DateTime>(type: "date", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerLoyaltyAccounts", x => x.CustomerId);
                    table.ForeignKey(
                        name: "FK_CustomerLoyaltyAccounts_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CustomerTravellers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "date", nullable: true),
                    Gender = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    NationalityId = table.Column<int>(type: "int", nullable: true),
                    PassportNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PassportExpiryDate = table.Column<DateTime>(type: "date", nullable: true),
                    PassportCountryId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerTravellers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomerTravellers_Countries_NationalityId",
                        column: x => x.NationalityId,
                        principalTable: "Countries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CustomerTravellers_Countries_PassportCountryId",
                        column: x => x.PassportCountryId,
                        principalTable: "Countries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CustomerTravellers_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CustomerTravelStats",
                columns: table => new
                {
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    TripsCompleted = table.Column<int>(type: "int", nullable: false),
                    TotalSpend = table.Column<decimal>(type: "decimal(15,2)", nullable: false),
                    LastTripAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerTravelStats", x => x.CustomerId);
                    table.ForeignKey(
                        name: "FK_CustomerTravelStats_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Role = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CustomerId = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FlightHotelSearchLegs",
                columns: table => new
                {
                    DeviceId = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    SearchId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Sequence = table.Column<int>(type: "int", nullable: false),
                    FromLocation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ToLocation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    DepartureDate = table.Column<DateTime>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FlightHotelSearchLegs", x => new { x.DeviceId, x.SearchId, x.Sequence });
                    table.ForeignKey(
                        name: "FK_FlightHotelSearchLegs_FlightHotelSearches_DeviceId_SearchId",
                        columns: x => new { x.DeviceId, x.SearchId },
                        principalTable: "FlightHotelSearches",
                        principalColumns: new[] { "DeviceId", "SearchId" },
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FlightSearchLegs",
                columns: table => new
                {
                    DeviceId = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    SearchId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Sequence = table.Column<int>(type: "int", nullable: false),
                    FromLocation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ToLocation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    DepartureDate = table.Column<DateTime>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FlightSearchLegs", x => new { x.DeviceId, x.SearchId, x.Sequence });
                    table.ForeignKey(
                        name: "FK_FlightSearchLegs_FlightSearches_DeviceId_SearchId",
                        columns: x => new { x.DeviceId, x.SearchId },
                        principalTable: "FlightSearches",
                        principalColumns: new[] { "DeviceId", "SearchId" },
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LeisurePackageDetails",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LeisurePackageId = table.Column<int>(type: "int", nullable: false),
                    Experience = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DetailsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TagsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WhatsIncludedJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ItineraryJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TiersJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AccommodationCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TransfersCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ServiceFee = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    EstimatedCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GalleryImagesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ReviewsJson = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeisurePackageDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeisurePackageDetails_LeisurePackages_LeisurePackageId",
                        column: x => x.LeisurePackageId,
                        principalTable: "LeisurePackages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FrequentFlyerPrograms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    AirlineId = table.Column<int>(type: "int", nullable: false),
                    ProgramName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MembershipNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    StatusLevel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FrequentFlyerPrograms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FrequentFlyerPrograms_Airlines_AirlineId",
                        column: x => x.AirlineId,
                        principalTable: "Airlines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FrequentFlyerPrograms_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    FlightId = table.Column<int>(type: "int", nullable: false),
                    BookingReference = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TotalPrice = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    SeatsBooked = table.Column<int>(type: "int", nullable: false),
                    BookingDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    PaymentStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SpecialRequests = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    SelectedServices = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    PassengerNames = table.Column<string>(type: "nvarchar(255)", maxLength: 2000, nullable: true),
                    PassengerDetailsJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PackageMetadataJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RefundMetadataJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PaymentMetadataJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BookingClass = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ConfirmedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CancellationReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsPaid = table.Column<bool>(type: "bit", nullable: false),
                    RefundAmount = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: true),
                    RefundedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsCheckedIn = table.Column<bool>(type: "bit", nullable: false),
                    SeatNumber = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    CheckedInAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bookings_Flights_FlightId",
                        column: x => x.FlightId,
                        principalTable: "Flights",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bookings_Users_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LeisurePlans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    PlanType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Tier = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DepartureAirport = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Destinations = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Passengers = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    EstimatedCost = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    Budget = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    LegsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ActivitiesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FlightsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HotelsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ItineraryJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MealPlanJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ConfirmedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CancellationReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeisurePlans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeisurePlans_Users_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RefreshTokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Token = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    IsRevoked = table.Column<bool>(type: "bit", nullable: false),
                    DeviceInfo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RefreshTokens_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserPreferences",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Language = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false, defaultValue: "en"),
                    CurrencyCode = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false, defaultValue: "USD"),
                    Theme = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Light"),
                    Timezone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    EmailNotifications = table.Column<bool>(type: "bit", nullable: false),
                    SMSNotifications = table.Column<bool>(type: "bit", nullable: false),
                    PushNotifications = table.Column<bool>(type: "bit", nullable: false),
                    PreferredRoute = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PreferredClass = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPreferences", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_UserPreferences_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserProfiles",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "date", nullable: true),
                    Gender = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    NationalityId = table.Column<int>(type: "int", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    AddressLine1 = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    AddressLine2 = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CountryId = table.Column<int>(type: "int", nullable: true),
                    PostalCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserProfiles", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_UserProfiles_Countries_CountryId",
                        column: x => x.CountryId,
                        principalTable: "Countries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_UserProfiles_Countries_NationalityId",
                        column: x => x.NationalityId,
                        principalTable: "Countries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserProfiles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Airlines_CountryId",
                table: "Airlines",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_BookingDate",
                table: "Bookings",
                column: "BookingDate");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_BookingReference",
                table: "Bookings",
                column: "BookingReference",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_CustomerId",
                table: "Bookings",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_FlightId",
                table: "Bookings",
                column: "FlightId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_Status",
                table: "Bookings",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_CarSearches_CreatedAt",
                table: "CarSearches",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_CarSearches_DeviceId",
                table: "CarSearches",
                column: "DeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerTravellers_CustomerId",
                table: "CustomerTravellers",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerTravellers_NationalityId",
                table: "CustomerTravellers",
                column: "NationalityId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerTravellers_PassportCountryId",
                table: "CustomerTravellers",
                column: "PassportCountryId");

            migrationBuilder.CreateIndex(
                name: "IX_FlightHotelSearches_CreatedAt",
                table: "FlightHotelSearches",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_FlightHotelSearches_DeviceId",
                table: "FlightHotelSearches",
                column: "DeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_FlightHotelSearchLegs_DeviceId_SearchId",
                table: "FlightHotelSearchLegs",
                columns: new[] { "DeviceId", "SearchId" });

            migrationBuilder.CreateIndex(
                name: "IX_Flights_FlightNumber",
                table: "Flights",
                column: "FlightNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FlightSearches_CreatedAt",
                table: "FlightSearches",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_FlightSearches_DeviceId",
                table: "FlightSearches",
                column: "DeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_FlightSearchLegs_DeviceId_SearchId",
                table: "FlightSearchLegs",
                columns: new[] { "DeviceId", "SearchId" });

            migrationBuilder.CreateIndex(
                name: "IX_FrequentFlyerPrograms_AirlineId",
                table: "FrequentFlyerPrograms",
                column: "AirlineId");

            migrationBuilder.CreateIndex(
                name: "IX_FrequentFlyerPrograms_CustomerId",
                table: "FrequentFlyerPrograms",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_HotelSearches_CreatedAt",
                table: "HotelSearches",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_HotelSearches_DeviceId",
                table: "HotelSearches",
                column: "DeviceId");

            migrationBuilder.CreateIndex(
                name: "IX_LeisurePackageDetails_LeisurePackageId",
                table: "LeisurePackageDetails",
                column: "LeisurePackageId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LeisurePlans_CustomerId",
                table: "LeisurePlans",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UserId",
                table: "RefreshTokens",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_RefundOptionCatalogItems_Code",
                table: "RefundOptionCatalogItems",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RefundOptionCatalogItems_IsActive_SortOrder",
                table: "RefundOptionCatalogItems",
                columns: new[] { "IsActive", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_ServicePackageCatalogItems_Code",
                table: "ServicePackageCatalogItems",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServicePackageCatalogItems_IsActive_SortOrder",
                table: "ServicePackageCatalogItems",
                columns: new[] { "IsActive", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_UserProfiles_CountryId",
                table: "UserProfiles",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_UserProfiles_NationalityId",
                table: "UserProfiles",
                column: "NationalityId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_CustomerId",
                table: "Users",
                column: "CustomerId",
                unique: true,
                filter: "[CustomerId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bookings");

            migrationBuilder.DropTable(
                name: "CarSearches");

            migrationBuilder.DropTable(
                name: "CustomerLoyaltyAccounts");

            migrationBuilder.DropTable(
                name: "CustomerTravellers");

            migrationBuilder.DropTable(
                name: "CustomerTravelStats");

            migrationBuilder.DropTable(
                name: "FlightHotelSearchLegs");

            migrationBuilder.DropTable(
                name: "FlightSearchLegs");

            migrationBuilder.DropTable(
                name: "FrequentFlyerPrograms");

            migrationBuilder.DropTable(
                name: "HotelSearches");

            migrationBuilder.DropTable(
                name: "LeisurePackageDetails");

            migrationBuilder.DropTable(
                name: "LeisurePlans");

            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.DropTable(
                name: "RefundOptionCatalogItems");

            migrationBuilder.DropTable(
                name: "ServicePackageCatalogItems");

            migrationBuilder.DropTable(
                name: "UserPreferences");

            migrationBuilder.DropTable(
                name: "UserProfiles");

            migrationBuilder.DropTable(
                name: "Flights");

            migrationBuilder.DropTable(
                name: "FlightHotelSearches");

            migrationBuilder.DropTable(
                name: "FlightSearches");

            migrationBuilder.DropTable(
                name: "Airlines");

            migrationBuilder.DropTable(
                name: "LeisurePackages");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Countries");

            migrationBuilder.DropTable(
                name: "Customers");
        }
    }
}
