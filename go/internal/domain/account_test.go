package domain_test

import (
	"context"
	"errors"
	"testing"

	"github.com/agentic/service/internal/domain"
)

func TestNewAccount(t *testing.T) {
	t.Parallel()

	testCases := []struct {
		name           string
		identifier     string
		initialBalance int64
		expectError    bool
	}{
		{
			name:           "valid account",
			identifier:     "acc_100",
			initialBalance: 5000,
			expectError:    false,
		},
		{
			name:           "empty identifier",
			identifier:     "",
			initialBalance: 5000,
			expectError:    true,
		},
		{
			name:           "negative balance",
			identifier:     "acc_101",
			initialBalance: -50,
			expectError:    true,
		},
	}

	for _, testCase := range testCases {
		testCase := testCase
		t.Run(testCase.name, func(t *testing.T) {
			t.Parallel()

			account, err := domain.NewAccount(testCase.identifier, testCase.initialBalance)
			if testCase.expectError {
				if err == nil {
					t.Fatalf("expected error, got nil")
				}
				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if account.ID != testCase.identifier {
				t.Errorf("expected ID %s, got %s", testCase.identifier, account.ID)
			}
			if account.BalanceMinor != testCase.initialBalance {
				t.Errorf("expected balance %d, got %d", testCase.initialBalance, account.BalanceMinor)
			}
		})
	}
}

func TestAccountDebit(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	account, err := domain.NewAccount("acc_200", 10000)
	if err != nil {
		t.Fatalf("failed to create account: %v", err)
	}

	t.Run("successful debit", func(t *testing.T) {
		t.Parallel()

		debited, debitErr := account.Debit(ctx, 3000, nil)
		if debitErr != nil {
			t.Fatalf("unexpected error: %v", debitErr)
		}
		if debited.BalanceMinor != 7000 {
			t.Errorf("expected balance 7000, got %d", debited.BalanceMinor)
		}
	})

	t.Run("insufficient funds", func(t *testing.T) {
		t.Parallel()

		_, debitErr := account.Debit(ctx, 20000, nil)
		if !errors.Is(debitErr, domain.ErrInsufficientFunds) {
			t.Errorf("expected ErrInsufficientFunds, got %v", debitErr)
		}
	})

	t.Run("invalid non-positive amount", func(t *testing.T) {
		t.Parallel()

		_, debitErr := account.Debit(ctx, 0, nil)
		if !errors.Is(debitErr, domain.ErrInvalidAmount) {
			t.Errorf("expected ErrInvalidAmount, got %v", debitErr)
		}
	})
}
