plugins {
    kotlin("jvm") version "2.1.0"
    kotlin("plugin.serialization") version "2.1.0"
    id("io.gitlab.arturbosch.detekt") version "1.23.7"
    id("org.jlleitschuh.gradle.ktlint") version "12.1.2"
    application
}

group = "com.agentic"
version = "0.1.0"

repositories {
    mavenCentral()
}

dependencies {
    // Kotlin Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.10.1")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")

    // Detekt Plugins
    detektPlugins("io.gitlab.arturbosch.detekt:detekt-rules-coroutines:1.23.7")

    // Testing
    testImplementation(kotlin("test"))
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.10.1")
    testImplementation("org.junit.jupiter:junit-jupiter:5.11.4")
}

kotlin {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_21)
        allWarningsAsErrors.set(true)
        optIn.addAll(
            "kotlin.RequiresOptIn",
            "kotlinx.coroutines.ExperimentalCoroutinesApi",
        )
        freeCompilerArgs.add("-Xjsr305=strict")
    }
}

detekt {
    buildUponDefaultConfig = true
    allRules = true
    config.setFrom(files("$projectDir/detekt.yml"))
}

tasks.withType<io.gitlab.arturbosch.detekt.Detekt>().configureEach {
    jvmTarget = "21"
}

tasks.withType<JavaCompile>().configureEach {
    sourceCompatibility = "21"
    targetCompatibility = "21"
}

tasks.test {
    useJUnitPlatform()
}
