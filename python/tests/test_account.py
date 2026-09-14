"""Unit tests for Account domain entity."""

import pytest

from service.domain.account import Account, AccountSuspendedError, InsufficientFundsError


def test_account_creation() -> None:
    account = Account(id="acc_123", balance_minor=10000)
    assert account.id == "acc_123"
    assert account.balance_minor == 10000
    assert account.is_active is True


def test_account_debit_success() -> None:
    account = Account(id="acc_123", balance_minor=10000)
    debited = account.debit(3000)
    assert debited.balance_minor == 7000
    assert account.balance_minor == 10000


def test_account_debit_insufficient_funds() -> None:
    account = Account(id="acc_123", balance_minor=2000)
    with pytest.raises(InsufficientFundsError):
        account.debit(5000)


def test_account_debit_suspended() -> None:
    account = Account(id="acc_123", balance_minor=10000, is_active=False)
    with pytest.raises(AccountSuspendedError):
        account.debit(1000)
