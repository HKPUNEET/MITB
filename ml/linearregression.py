import pandas as pd  # For data loading and manipulation
from sklearn.model_selection import train_test_split  # For splitting data into train and test sets
from sklearn.preprocessing import StandardScaler  # For feature scaling
from sklearn.linear_model import LinearRegression  # The linear regression model
from sklearn.metrics import mean_squared_error, r2_score  # For evaluating model performance
import matplotlib.pyplot as plt  # For plotting graphs
import numpy as np  # For numerical operations


# Function to load data from CSV file
def load_data(file_path):
    """
    Loads the dataset from a CSV file.
    :param file_path: String path to the CSV file.
    :return: Pandas DataFrame.
    """
    data = pd.read_csv(file_path)  # Read the CSV into a DataFrame
    return data


# Function to preprocess data: select features/target, scale features, and split into train/test
def preprocess_data(data, feature_cols, target_col, test_size=0.2):
    """
    Preprocesses the data by selecting columns, scaling, and splitting.
    :param data: Pandas DataFrame.
    :param feature_cols: List of strings for feature column names.
    :param target_col: String for target column name.
    :param test_size: Float for test set proportion (default 0.2).
    :return: X_train, X_test, y_train, y_test (scaled features and targets).
    """
    X = data[feature_cols]  # Select feature columns
    y = data[target_col]  # Select target column
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)  # Split data
    scaler = StandardScaler()  # Initialize scaler
    X_train = scaler.fit_transform(X_train)  # Fit and transform training features
    X_test = scaler.transform(X_test)  # Transform test features
    return X_train, X_test, y_train, y_test


# Function to train the linear regression model
def train_model(X_train, y_train):
    """
    Trains a linear regression model.
    :param X_train: Scaled training features.
    :param y_train: Training targets.
    :return: Trained model.
    """
    model = LinearRegression()  # Initialize the model
    model.fit(X_train, y_train)  # Train the model on training data
    return model


# Function to evaluate the model and print metrics
def evaluate_model(model, X_test, y_test):
    """
    Evaluates the model on test data.
    :param model: Trained model.
    :param X_test: Scaled test features.
    :param y_test: Test targets.
    :return: Predictions, MSE, R2 score.
    """
    y_pred = model.predict(X_test)  # Make predictions on test data
    mse = mean_squared_error(y_test, y_pred)  # Calculate mean squared error
    r2 = r2_score(y_test, y_pred)  # Calculate R-squared score
    print(f"Mean Squared Error: {mse}")  # Print MSE
    print(f"R-squared: {r2}")  # Print R2
    return y_pred, mse, r2


# Function to plot actual vs predicted values
def plot_results(y_test, y_pred):
    """
    Plots a scatter plot of actual vs predicted values.
    :param y_test: Actual test targets.
    :param y_pred: Predicted values.
    """
    plt.figure(figsize=(10, 6))  # Set figure size
    plt.scatter(y_test, y_pred, alpha=0.5)  # Plot scatter points
    plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--')  # Plot ideal line (y=x)
    plt.xlabel('Actual Values')  # X-axis label
    plt.ylabel('Predicted Values')  # Y-axis label
    plt.title('Actual vs Predicted')  # Plot title
    plt.show()  # Display the plot


# Example usage: Plug in your values here
if __name__ == "__main__":
    file_path = 'your_dataset.csv'  # Replace with your CSV file path
    feature_cols = ['feature1', 'feature2']  # Replace with your feature column names
    target_col = 'target'  # Replace with your target column name

    data = load_data(file_path)  # Load data
    X_train, X_test, y_train, y_test = preprocess_data(data, feature_cols, target_col)  # Preprocess
    model = train_model(X_train, y_train)  # Train
    y_pred, mse, r2 = evaluate_model(model, X_test, y_test)  # Evaluate
    plot_results(y_test, y_pred)  # Plot