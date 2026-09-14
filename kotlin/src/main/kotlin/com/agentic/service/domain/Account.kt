package com.agentic.service.domain

@JvmInline
value class AccountId(val value: String) {
    init {
        require(value.isNotBlank()) { "Account id cannot be blank" }
    }
}

sealed interface AccountError {
    data class Suspended(val accountId: AccountId) : AccountError

    data class InsufficientFunds(val availableMinor: Long, val requiredMinor: Long) : AccountError
}

data class Account(
    val id: AccountId,
    val balanceMinor: Long,
    val isActive: Boolean = true,
) {
    fun debit(amountMinor: Long): Result<Account> {
        if (!isActive) {
            return Result.failure(IllegalStateException("Account ${id.value} is suspended"))
        }
        if (amountMinor <= 0) {
            return Result.failure(IllegalArgumentException("Debit amount must be positive"))
        }
        if (balanceMinor < amountMinor) {
            return Result.failure(
                IllegalStateException(
                    "Insufficient funds: available $balanceMinor < required $amountMinor",
                ),
            )
        }
        return Result.success(copy(balanceMinor = balanceMinor - amountMinor))
    }
}
