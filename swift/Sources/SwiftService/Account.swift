import Foundation

/// A type-safe domain identifier for an account.
public struct AccountId: Sendable, Hashable {
    public let value: String

    public init(value: String) {
        self.value = value
    }
}

/// An immutable domain entity representing an account.
public struct Account: Sendable, Equatable {
    public let id: AccountId
    public let balanceMinor: Int64
    public let isActive: Bool

    public init(id: AccountId, balanceMinor: Int64, isActive: Bool = true) {
        self.id = id
        self.balanceMinor = balanceMinor
        self.isActive = isActive
    }
}
