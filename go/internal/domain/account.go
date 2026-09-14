package domain

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
)

var (
	// ErrAccountSuspended indicates an operation was attempted on an inactive account.
	ErrAccountSuspended = errors.New("account is suspended")

	// ErrInsufficientFunds indicates the account lacks sufficient balance.
	ErrInsufficientFunds = errors.New("insufficient funds")

	// ErrInvalidAmount indicates the transaction amount is non-positive.
	ErrInvalidAmount = errors.New("amount must be positive")
)

// Account represents an immutable domain entity.
type Account struct {
	ID           string
	BalanceMinor int64
	IsActive     bool
}

// NewAccount initializes a validated Account instance.
func NewAccount(identifier string, initialBalance int64) (*Account, error) {
	if identifier == "" {
		return nil, fmt.Errorf("account identifier cannot be empty: %w", errors.ErrUnsupported)
	}
	if initialBalance < 0 {
		return nil, fmt.Errorf("initial balance must be non-negative: %w", ErrInvalidAmount)
	}

	return &Account{
		ID:           identifier,
		BalanceMinor: initialBalance,
		IsActive:     true,
	}, nil
}

// Debit processes a balance deduction and returns a new updated Account instance.
func (account *Account) Debit(ctx context.Context, amountMinor int64, logger *slog.Logger) (*Account, error) {
	if !account.IsActive {
		return nil, fmt.Errorf("debit failed for %s: %w", account.ID, ErrAccountSuspended)
	}
	if amountMinor <= 0 {
		return nil, fmt.Errorf("debit failed: %w", ErrInvalidAmount)
	}
	if account.BalanceMinor < amountMinor {
		return nil, fmt.Errorf("debiting %d from %d: %w", amountMinor, account.BalanceMinor, ErrInsufficientFunds)
	}

	if logger != nil {
		logger.InfoContext(ctx, "account debited successfully",
			slog.String("account_id", account.ID),
			slog.Int64("amount_minor", amountMinor),
			slog.Int64("new_balance_minor", account.BalanceMinor-amountMinor),
		)
	}

	return &Account{
		ID:           account.ID,
		BalanceMinor: account.BalanceMinor - amountMinor,
		IsActive:     account.IsActive,
	}, nil
}
