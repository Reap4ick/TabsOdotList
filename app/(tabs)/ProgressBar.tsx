import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';

const ProgressBar = () => {
    const [progress, setProgress] = useState(0);
    const animatedProgress = useSharedValue(0);

    const handleNext = () => {
        const newValue = progress >= 100 ? 0 : progress + 25;
        setProgress(newValue);
        animatedProgress.value = withTiming(newValue, { duration: 500 });
    };

    const animatedStyles = useAnimatedStyle(() => ({
        width: `${animatedProgress.value}%`,
        backgroundColor: interpolateColor(
            animatedProgress.value,
            [0, 25, 50, 75, 100],
            ['gray', 'blue', 'green', 'yellow', 'red']
        ),
    }));

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Прогрес: {progress}%</Text>
            <View style={styles.progressBar}>
                <Animated.View style={[styles.progress, animatedStyles]} />
            </View>
            <Button title="Next" onPress={handleNext} />
        </View>
    );
};

export default ProgressBar;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginTop: 40,
    },
    text: {
        fontSize: 18,
        marginBottom: 10,
    },
    progressBar: {
        width: '80%',
        height: 20,
        backgroundColor: '#ddd',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 10,
    },
    progress: {
        height: '100%',
        borderRadius: 10,
    },
});

