// import React, { useState } from 'react';
// import { View, Text, Button, StyleSheet } from 'react-native';
// import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';

// const ProgressBar = () => {
//     const [progress, setProgress] = useState(0);
//     const animatedProgress = useSharedValue(0);

//     const handleNext = () => {
//         const newValue = progress >= 100 ? 0 : progress + 25;
//         setProgress(newValue);
//         animatedProgress.value = withTiming(newValue, { duration: 500 });
//     };

//     const animatedStyles = useAnimatedStyle(() => ({
//         width: `${animatedProgress.value}%`,
//         backgroundColor: interpolateColor(
//             animatedProgress.value,
//             [0, 25, 50, 75, 100],
//             ['gray', 'blue', 'green', 'yellow', 'red']
//         ),
//     }));

//     return (
//         <View style={styles.container}>
//             <Text style={styles.text}>Прогрес: {progress}%</Text>
//             <View style={styles.progressBar}>
//                 <Animated.View style={[styles.progress, animatedStyles]} />
//             </View>
//             <Button title="Next" onPress={handleNext} />
//         </View>
//     );
// };

// export default ProgressBar;

// const styles = StyleSheet.create({
//     container: {
//         alignItems: 'center',
//         marginTop: 40,
//     },
//     text: {
//         fontSize: 18,
//         marginBottom: 10,
//     },
//     progressBar: {
//         width: '80%',
//         height: 20,
//         backgroundColor: '#ddd',
//         borderRadius: 10,
//         overflow: 'hidden',
//         marginBottom: 10,
//     },
//     progress: {
//         height: '100%',
//         borderRadius: 10,
//     },
// });

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import React, { useEffect } from 'react'
import { Alert, Button, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { useSharedValue, Easing, useAnimatedStyle, withDelay, withRepeat, withSpring, withTiming, interpolateColor } from 'react-native-reanimated'

const Animation = () => {
    const width = useSharedValue(200);
    const rotateDeg = useSharedValue<number>(0);

    const handleStart = () => {
        // width.value = 400; // різка зміна
        // withTiming - плавна зміна
        // withRepeat - повторення анімації
        // withSpring - пружинна анімація
        // withDalay - затримка анімації
        // withSequence - послідовна анімація

        width.value = withRepeat(withTiming(400, { duration: 1000 }), 1, true, () => {
            console.log("Animation completed");
            width.value = withSpring(50, {
                stiffness: 389,
            }, () => {
                width.value = withTiming(100);
            });
        });
    };

    const handlePress = () => {
        if (rotateDeg.value <= 180)
            rotateDeg.value = withTiming(rotateDeg.value + 60);
        else
            rotateDeg.value = withTiming(rotateDeg.value - 60);
    };

    const animatedStyles = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotateDeg.value}deg` }],
        backgroundColor: interpolateColor(
            width.value,
            [100, 200, 400],
            ['violet', 'green', 'red']
        ),
    }));

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Animations</Text>
            <Button
                title='Start'
                onPress={handleStart}
            />
            <Pressable  onPress={handlePress}>
                <Animated.View
                    style={[{
                        width: width,
                        height: 100,
                        backgroundColor: 'violet',
                        display: 'flex',
                        justifyContent: "flex-start",
                        alignItems: "flex-start",
                        marginTop: 20,
                        gap: 10,
                    }, animatedStyles]}
                />
            </Pressable>
        </View>
    )
}

export default Animation

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        justifyContent: "center",
        alignItems: 'center',
        marginTop: 20,
        gap: 10,
    },
    Bar: {
        display: 'flex',
        justifyContent: "flex-start",
        alignItems: "flex-start",
        marginTop: 20,
        gap: 10,
    },
    text: {
        color: 'black',
        fontSize: 18,
        textAlign: 'center'
    },
})