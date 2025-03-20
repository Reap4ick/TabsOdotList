import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Ласкаво просимо!</Text>
            <Text style={styles.text}>Це головний екран вашого додатку для управління задачами.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
    },
});