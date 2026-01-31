import pandas as pd  # Data
from sklearn.preprocessing import StandardScaler  # Scaling
from sklearn.cluster import KMeans  # KMeans model
from sklearn.decomposition import PCA  # For dimensionality reduction in plotting
from sklearn.metrics import silhouette_score  # For evaluation
import matplotlib.pyplot as plt  # Plotting
import numpy as np  # Numerical ops


# Modified load_data to not require target
def load_data(file_path):
    """
    Loads data from CSV.
    :param file_path: Path to CSV.
    :return: DataFrame.
    """
    data = pd.read_csv(file_path)  # Read CSV
    return data


# Preprocess for clustering: select features, scale (no split, no target)
def preprocess_data(data, feature_cols):
    """
    Preprocesses for unsupervised: select, scale.
    :param data: DataFrame.
    :param feature_cols: List of feature columns.
    :return: Scaled features.
    """
    X = data[feature_cols]  # Select features
    scaler = StandardScaler()  # Init scaler
    X_scaled = scaler.fit_transform(X)  # Scale
    return X_scaled


# Function to find optimal number of clusters using elbow method
def find_optimal_clusters(X_scaled, max_k=10):
    """
    Computes inertia for k=1 to max_k to plot elbow.
    :param X_scaled: Scaled features.
    :param max_k: Max clusters to test.
    :return: List of inertias.
    """
    inertias = []  # List for inertias
    for k in range(1, max_k + 1):  # Loop over k
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)  # Init KMeans
        kmeans.fit(X_scaled)  # Fit
        inertias.append(kmeans.inertia_)  # Append inertia
    return inertias


# Function to train KMeans
def train_model(X_scaled, n_clusters=3):
    """
    Trains KMeans model.
    :param X_scaled: Scaled features.
    :param n_clusters: Number of clusters.
    :return: Trained model, cluster labels.
    """
    model = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)  # Init
    labels = model.fit_predict(X_scaled)  # Fit and predict labels
    return model, labels


# Function to evaluate (silhouette score)
def evaluate_model(X_scaled, labels):
    """
    Computes silhouette score.
    :param X_scaled: Features.
    :param labels: Cluster labels.
    :return: Silhouette score.
    """
    score = silhouette_score(X_scaled, labels)  # Calculate score
    print(f"Silhouette Score: {score}")  # Print
    return score


# Function to plot results (elbow and cluster scatter with PCA if needed)
def plot_results(X_scaled, inertias, labels, n_clusters):
    """
    Plots elbow method and cluster visualization.
    :param X_scaled: Scaled features.
    :param inertias: List from elbow method.
    :param labels: Cluster labels.
    :param n_clusters: Number of clusters.
    """
    # Elbow plot
    plt.figure(figsize=(12, 5))  # Size
    plt.subplot(1, 2, 1)  # First subplot
    plt.plot(range(1, len(inertias) + 1), inertias, marker='o')  # Plot inertias
    plt.xlabel('Number of Clusters')  # Labels
    plt.ylabel('Inertia')
    plt.title('Elbow Method')

    # Cluster scatter (use PCA for 2D viz if features > 2)
    pca = PCA(n_components=2)  # Init PCA
    X_pca = pca.fit_transform(X_scaled)  # Transform to 2D
    plt.subplot(1, 2, 2)  # Second subplot
    scatter = plt.scatter(X_pca[:, 0], X_pca[:, 1], c=labels, cmap='viridis', alpha=0.5)  # Scatter with colors
    plt.colorbar(scatter, ticks=range(n_clusters))  # Colorbar
    plt.xlabel('PCA Component 1')
    plt.ylabel('PCA Component 2')
    plt.title('Clusters Visualization')
    plt.show()


# Example usage
if __name__ == "__main__":
    file_path = 'your_dataset.csv'  # Replace
    feature_cols = ['feature1', 'feature2']  # Replace (all features for clustering)
    n_clusters = 3  # Choose based on elbow

    data = load_data(file_path)
    X_scaled = preprocess_data(data, feature_cols)
    inertias = find_optimal_clusters(X_scaled)  # Get elbow data
    model, labels = train_model(X_scaled, n_clusters)
    score = evaluate_model(X_scaled, labels)
    plot_results(X_scaled, inertias, labels, n_clusters)