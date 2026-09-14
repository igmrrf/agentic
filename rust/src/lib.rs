//! Agentic Engineering Standards reference crate.
//!
//! Demonstrates Rust 2024 idioms, zero unwrap, and strict quality gates.

#![deny(unsafe_code)]
#![warn(missing_docs)]

/// A sample domain identifier demonstrating the newtype pattern.
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct EntityId(String);

impl EntityId {
    /// Creates a new `EntityId` if the input is non-empty.
    #[must_use]
    pub fn new(identifier: &str) -> Option<Self> {
        if identifier.is_empty() {
            None
        } else {
            Some(Self(identifier.to_owned()))
        }
    }

    /// Returns a borrowed slice of the inner identifier.
    #[must_use]
    pub fn as_str(&self) -> &str {
        &self.0
    }
}
