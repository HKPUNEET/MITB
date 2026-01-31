import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier  # Random Forest models
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, confusion_matrix, ConfusionMatrixDisplay
import matplotlib.pyplot as plt
import numpy as np


# Reuse load_data and preprocess_data

# Function to train the random forest model
def train_model(X_train, y_train, task_type='regression', n_estimators=100):
    """
    Trains a random forest model.
    :param X_train: Features.
    :param y_train: Targets.
    :param task_type: 'regression' or 'classification'.
    :param n_estimators: Number of trees (default 100).
    :return: Trained model.
    """
    if task_type == 'regression':
        model = RandomForestRegressor(n_estimators=n_estimators, random_state=42)  # Init regressor
    else:
        model = RandomForestClassifier(n_estimators=n_estimators, random_state=42)  # Init classifier
    model.fit(X_train, y_train)  # Train
    return model


# Function to evaluate the model
def evaluate_model(model, X_test, y_test, task_type='regression'):
    """
    Evaluates based on task type.
    :param model: Trained model.
    :param X_test: Test features.
    :param y_test: Test targets.
    :param task_type: 'regression' or 'classification'.
    :return: Predictions and metric.
    """
    y_pred = model.predict(X_test)  # Predict
    if task_type == 'regression':
        mse = mean_squared_error(y_test, y_pred)  # MSE for regression
        r2 = r2_score(y_test, y_pred)  # R2 for regression
        print(f"Mean Squared Error: {mse}, R-squared: {r2}")
        return y_pred, (mse, r2)
    else:
        accuracy = accuracy_score(y_test, y_pred)  # Accuracy for classification
        print(f"Accuracy: {accuracy}")
        return y_pred, accuracy


# Function to plot results (actual vs pred for regression, confusion matrix for classification)
def plot_results(y_test, y_pred, task_type='regression'):
    """
    Plots based on task type.
    :param y_test: Actual.
    :param y_pred: Predicted.
    :param task_type: 'regression' or 'classification'.
    """
    if task_type == 'regression':
        plt.figure(figsize=(10, 6))
        plt.scatter(y_test, y_pred, alpha=0.5)
        plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--')
        plt.xlabel('Actual')
        plt.ylabel('Predicted')
        plt.title('Actual vs Predicted')
        plt.show()
    else:
        cm = confusion_matrix(y_test, y_pred)
        disp = ConfusionMatrixDisplay(confusion_matrix=cm)
        disp.plot(cmap=plt.cm.Blues)
        plt.title('Confusion Matrix')
        plt.show()


# Example usage
if __name__ == "__main__":
    file_path = 'your_dataset.csv'
    feature_cols = ['feature1', 'feature2']
    target_col = 'target'
    task_type = 'regression'  # Or 'classification'

    data = load_data(file_path)
    X_train, X_test, y_train, y_test = preprocess_data(data, feature_cols, target_col)
    model = train_model(X_train, y_train, task_type)
    y_pred, metric = evaluate_model(model, X_test, y_test, task_type)
    plot_results(y_test, y_pred, task_type)