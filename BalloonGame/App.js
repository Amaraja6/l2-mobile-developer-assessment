// Importing necessary components and assets
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  Modal,
} from "react-native";

// Background image
const bgImg = require("./assets/clouds.jpg");

export default function App() {
  // States for game control
  const [showContent, setShowContent] = useState(true); // Control game content visibility
  const [showResetButton, setShowResetButton] = useState(false); // Control reset button visibility
  const [timer, setTimer] = useState(120); // Game timer (2 minutes)
  const [intervalId, setIntervalId] = useState(null); // Interval ID for controlling game intervals
  const [circles, setCircles] = useState([]); // Array to store circles (balloons)
  const [speed, setSpeed] = useState(2); // Speed of the moving circles
  const [poppedCount, setPoppedCount] = useState(0); // Count of popped balloons
  const [missedCount, setMissedCount] = useState(0); // Count of missed balloons
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility for game over
  const [remainingCirclesVisible, setRemainingCirclesVisible] = useState(true); // Control remaining circles visibility

  // Screen width for positioning
  const screenWidth = Dimensions.get("window").width;
  // Size of the circles (balloons)
  const circleSize = 50;

  // Define an array of colors
  const circleColors = ["red", "blue", "green"];

  // Function to generate a random position for the circles
  const generateRandomPosition = () => {
    return Math.random() * (screenWidth - circleSize);
  };

  // Function to move the circles downwards
  const moveCircles = () => {
    // Update circle positions based on speed
    setCircles((prevCircles) => {
      const newCircles = prevCircles.map((circle) => ({
        ...circle,
        bottom: circle.bottom + speed,
      }));

      // Check if circles reach the bottom of the screen
      newCircles.forEach((circle) => {
        if (circle.bottom >= Dimensions.get("window").height) {
          handleMissed(); // Handle missed balloons when they reach the bottom
        }
      });

      // Filter out circles that are still visible
      return remainingCirclesVisible
        ? newCircles.filter(
            (circle) => circle.bottom < Dimensions.get("window").height
          )
        : [];
    });
  };

  // Effect hook to create new circles at intervals when the game is active
  useEffect(() => {
    if (!showContent) {
      // Set interval to generate new circles
      const circleIntervalId = setInterval(() => {
        setCircles((prevCircles) => [
          ...prevCircles,
          {
            key: Math.random().toString(),
            left: generateRandomPosition(),
            bottom: 0,
          },
        ]);
      }, 1000); // Adjust this interval for circle appearance frequency

      setIntervalId(circleIntervalId);
    }

    // Clear interval when component unmounts or game content changes
    return () => clearInterval(intervalId);
  }, [showContent]);

  // Effect hook to move the circles downwards when the game is active
  useEffect(() => {
    if (!showContent) {
      // Set interval to move circles
      const moveIntervalId = setInterval(moveCircles, 25); // Adjust this interval for circle movement smoothness
      return () => clearInterval(moveIntervalId); // Clear interval on component unmount or circle visibility changes
    }
  }, [circles, remainingCirclesVisible]);

  // Effect hook to gradually increase the speed every 30 seconds
  useEffect(() => {
    // Set interval to increase speed
    const speedIncreaseInterval = setInterval(() => {
      setSpeed((prevSpeed) => {
        const newSpeed = prevSpeed + 1;
        return newSpeed <= 7 ? newSpeed : prevSpeed; // Limit speed to 7 units per second
      });
    }, 30000);

    // Clear speed increase interval on component unmount
    return () => clearInterval(speedIncreaseInterval);
  }, []);

  // Effect hook to handle end of game when timer reaches 0
  useEffect(() => {
    if (timer === 0) {
      clearInterval(intervalId);
      setShowContent(false);
      setShowResetButton(true);
      setModalVisible(true);
      setRemainingCirclesVisible(false);
    }
  }, [timer, intervalId]);

  // Function to handle start button press
  const handleStartPress = () => {
    clearInterval(intervalId); // Clear any existing interval
    setTimer(120); // 2 minutes timer
    setShowContent(false);
    setShowResetButton(true);
    const newIntervalId = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer > 0) {
          return prevTimer - 1;
        } else {
          clearInterval(newIntervalId); // Clear the interval when timer reaches 0
          setShowContent(true);
          setShowResetButton(false);
          return 0;
        }
      });
    }, 1000);
    setIntervalId(newIntervalId);
  };

  // Function to handle reset button press
  const handleResetButton = () => {
    clearInterval(intervalId); // Clear the interval when resetting
    setShowContent(true);
    setShowResetButton(false);
    setTimer(120); // 2 minutes timer
    setSpeed(2); // Reset speed
    setCircles([]); // Clear balloons
    setPoppedCount(0); // Reset popped count
    setMissedCount(0); // Reset missed count
    setModalVisible(false);
    setRemainingCirclesVisible(true);
  };

  // Function to handle balloon pop
  const handlePop = (key) => {
    // Remove popped balloon from the array
    setCircles((prevCircles) =>
      prevCircles.filter((circle) => circle.key !== key)
    );
    // Increment popped count
    setPoppedCount((prevCount) => prevCount + 2);
  };

  // Function to handle missed balloon
  const handleMissed = () => {
    // Increment missed count
    setMissedCount((prevCount) => prevCount + 1);
  };

  // Function to handle replay button press
  const handleReplay = () => {
    // Reset game state
    setModalVisible(false);
    clearInterval(intervalId); // Clear any existing interval
    setPoppedCount(0); // Reset popped count
    setMissedCount(0); // Reset missed count
    setTimer(120); // Reset timer
    setSpeed(2); // Reset speed
    setCircles([]); // Clear balloons
    setRemainingCirclesVisible(true);
    handleStartPress(); // Start the game again
  };

  // Render game components
  return (
    <View style={styles.container}>
      {/* Background image */}
      <ImageBackground source={bgImg} style={styles.bgStyle} />
      {/* Render circles (balloons) */}
      {/* Render circles (balloons) */}
      {circles.map((circle, index) => (
        <TouchableOpacity
          key={circle.key}
          style={{
            ...styles.circle,
            left: circle.left,
            bottom: circle.bottom,
            backgroundColor: circleColors[index % circleColors.length], // Assigning colors from the array in a cyclic manner
          }}
          onPress={() => handlePop(circle.key)}
        />
      ))}
      {/* Render game content if active */}
      {showContent && (
        <View style={styles.overlay}>
          <Text style={styles.text}>
            <Text style={{ color: "#fc4c4e" }}>POP </Text>
            <Text style={{ color: "orange" }}>THE </Text>
            <Text style={{ color: "#028a0f" }}>BALLOONS</Text>
          </Text>
        </View>
      )}
      {/* Start button */}
      {showContent && (
        <TouchableOpacity style={styles.button} onPress={handleStartPress}>
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>
      )}
      {/* Reset button */}
      {showResetButton && (
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetButton}
        >
          <Text style={styles.buttonText}>Exit</Text>
        </TouchableOpacity>
      )}
      {/* Timer display */}
      {!showContent && (
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            {`${String(Math.floor(timer / 60)).padStart(2, "0")}:${String(
              timer % 60
            ).padStart(2, "0")}`}
          </Text>
        </View>
      )}
      {/* Score card */}
      {!showContent && (
        <View style={styles.scoreCard}>
          <View style={styles.score}>
            <Text style={styles.scoreLabel}>Balloons Popped</Text>
            <Text style={styles.scoreValue}>{poppedCount}</Text>
          </View>
          <View style={styles.score}>
            <Text style={styles.scoreLabel}>Balloons Missed</Text>
            <Text style={styles.scoreValue}>{missedCount}</Text>
          </View>
        </View>
      )}
      {/* Game over modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Game Over</Text>
            <Text style={styles.modalScore}>
              Final Score: {poppedCount === 0 ? 0 : poppedCount - missedCount}
            </Text>
            {/* Home and Replay buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                }}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleReplay}
                style={[styles.modalButton, styles.modalButtonReplay]}
              >
                <Text style={styles.modalButtonText}>Replay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Styles for game components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bgStyle: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 400,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "black",
    fontSize: 35,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    bottom: 50,
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  resetButton: {
    backgroundColor: "#ff0000",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    position: "absolute",
    top: 60,
    left: 15,
  },
  timerContainer: {
    position: "absolute",
    top: 60,
    right: 20,
  },
  timerText: {
    fontSize: 50,
    fontWeight: "bold",
    color: "white",
  },
  circle: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  scoreCard: {
    position: "absolute",
    flexDirection: "row",
    top: 120,
    justifyContent: "space-around",
    width: "100%",
  },
  score: {
    alignItems: "center",
    top: 20,
  },
  scoreLabel: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalScore: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
  },
  modalButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  modalButtonReplay: {
    backgroundColor: "#28a745",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
