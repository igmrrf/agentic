// swift-tools-version: 6.0
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "SwiftService",
    platforms: [
        .macOS(.v14),
        .iOS(.v17),
    ],
    products: [
        .library(
            name: "SwiftService",
            targets: ["SwiftService"]
        ),
    ],
    dependencies: [],
    targets: [
        .target(
            name: "SwiftService",
            dependencies: [],
            swiftSettings: [
                .enableUpcomingFeature("ExistentialAny"),
            ]
        ),
        .testTarget(
            name: "SwiftServiceTests",
            dependencies: ["SwiftService"]
        ),
    ],
    swiftLanguageModes: [.v6]
)
