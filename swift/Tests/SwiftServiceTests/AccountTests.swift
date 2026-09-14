import Testing
@testable import SwiftService

@Test func testAccountInitialization() {
    let accountId = AccountId(value: "acc_123")
    let account = Account(id: accountId, balanceMinor: 5000)
    #expect(account.id.value == "acc_123")
    #expect(account.balanceMinor == 5000)
    #expect(account.isActive)
}
