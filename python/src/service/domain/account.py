"""Domain models and business logic for account management."""

from dataclasses import dataclass


class DomainError(Exception):
    """Base domain exception."""


class AccountSuspendedError(DomainError):
    """Raised when an operation is attempted on a suspended account."""

    def __init__(self, account_id: str) -> None:
        super().__init__(f"account {account_id} is suspended")
        self.account_id = account_id


class InsufficientFundsError(DomainError):
    """Raised when an account does not possess sufficient funds."""

    def __init__(self, account_id: str, available_minor: int, required_minor: int) -> None:
        super().__init__(
            f"account {account_id} has insufficient funds: {available_minor} < {required_minor}"
        )
        self.account_id = account_id
        self.available_minor = available_minor
        self.required_minor = required_minor


@dataclass(frozen=True, slots=True)
class Account:
    """Immutable domain representation of an account."""

    id: str
    balance_minor: int
    is_active: bool = True

    def debit(self, amount_minor: int) -> "Account":
        """Deduct amount from account balance, returning a new Account instance."""
        if not self.is_active:
            raise AccountSuspendedError(self.id)
        if self.balance_minor < amount_minor:
            raise InsufficientFundsError(self.id, self.balance_minor, amount_minor)
        return Account(
            id=self.id,
            balance_minor=self.balance_minor - amount_minor,
            is_active=self.is_active,
        )
