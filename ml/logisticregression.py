import pandas as pd  # For data loading and manipulation
from sklearn.model_selection import train_test_split  # For splitting data
from sklearn.preprocessing import StandardScaler  # For scaling
from sklearn.linear_model import LogisticRegression  # The logistic regression model
from sklearn.metrics import accuracy_score, confusion_matrix, ConfusionMatrixDisplay  # For evaluation
import matplotlib.pyplot as plt  # For plotting


# Reuse load_data and preprocess_data from above (same as linear regression)
# ... (Copy load_data and preprocess_data functions here if running separately)

# Function to train the logistic regression model
def train_model(X_train, y_train):
    """
    Trains a logistic regression model.
    :param X_train: Scaled training features.
    :param y_train: Training targets (categorical).
    :return: Trained model.
    """
    model = LogisticRegression(max_iter=200)  # Initialize model with max iterations to ensure convergence
    model.fit(X_train, y_train)  # Train on data
    return model


# Function to evaluate the model and print metrics
def evaluate_model(model, X_test, y_test):
    """
    Evaluates the model on test data.
    :param model: Trained model.
    :param X_test: Scaled test features.
    :param y_test: Test targets.
    :return: Predictions, accuracy.
    """
    y_pred = model.predict(X_test)  # Make predictions
    accuracy = accuracy_score(y_test, y_pred)  # Calculate accuracy
    print(f"Accuracy: {accuracy}")  # Print accuracy
    return y_pred, accuracy


# Function to plot confusion matrix
def plot_results(y_test, y_pred):
    """
    Plots the confusion matrix.
    :param y_test: Actual test targets.
    :param y_pred: Predicted values.
    """
    cm = confusion_matrix(y_test, y_pred)  # Compute confusion matrix
    disp = ConfusionMatrixDisplay(confusion_matrix=cm)  # Create display object
    disp.plot(cmap=plt.cm.Blues)  # Plot with blue color map
    plt.title('Confusion Matrix')  # Set title
    plt.show()  # Display plot


# Example usage: Plug in your values here
if __name__ == "__main__":
    file_path = 'your_dataset.csv'  # Replace with path
    feature_cols = ['feature1', 'feature2']  # Replace features
    target_col = 'target'  # Replace target (e.g., 0/1 classes)

    data = load_data(file_path)
    X_train, X_test, y_train, y_test = preprocess_data(data, feature_cols, target_col)
    model = train_model(X_train, y_train)
    y_pred, accuracy = evaluate_model(model, X_test, y_test)
    plot_results(y_test, y_pred)