package com.agentic.service.domain

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class AccountTest {
    @Test
    fun `test valid account initialization`() {
        val account = Account(id = AccountId("acc_123"), balanceMinor = 10000L)
        assertEquals("acc_123", account.id.value)
        assertEquals(10000L, account.balanceMinor)
        assertTrue(account.isActive)
    }

    @Test
    fun `test successful debit`() {
        val account = Account(id = AccountId("acc_123"), balanceMinor = 10000L)
        val result = account.debit(3000L)
        assertTrue(result.isSuccess)
        val updated = result.getOrThrow()
        assertEquals(7000L, updated.balanceMinor)
    }

    @Test
    fun `test debit exceeding balance fails`() {
        val account = Account(id = AccountId("acc_123"), balanceMinor = 1000L)
        val result = account.debit(3000L)
        assertTrue(result.isFailure)
    }

    @Test
    fun `test debit suspended account fails`() {
        val account = Account(id = AccountId("acc_123"), balanceMinor = 10000L, isActive = false)
        val result = account.debit(1000L)
        assertTrue(result.isFailure)
    }
}
