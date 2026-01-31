import pandas as pd  # For data handling
from sklearn.model_selection import train_test_split  # For data splitting
from sklearn.preprocessing import StandardScaler  # For scaling
from sklearn.tree import DecisionTreeRegressor, DecisionTreeClassifier, plot_tree  # Decision Tree models and plotting
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, confusion_matrix, \
    ConfusionMatrixDisplay  # Metrics
import matplotlib.pyplot as plt  # For graphs


# Reuse load_data and preprocess_data from previous examples (e.g., linear regression)

# Function to train the decision tree model
def train_model(X_train, y_train, task_type='regression', max_depth=None):
    """
    Trains a decision tree model.
    :param X_train: Scaled training features.
    :param y_train: Training targets.
    :param task_type: 'regression' or 'classification'.
    :param max_depth: Max tree depth (default None for unlimited).
    :return: Trained model.
    """
    if task_type == 'regression':
        model = DecisionTreeRegressor(max_depth=max_depth, random_state=42)  # Init regressor
    else:
        model = DecisionTreeClassifier(max_depth=max_depth, random_state=42)  # Init classifier
    model.fit(X_train, y_train)  # Train the model
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
    y_pred = model.predict(X_test)  # Make predictions
    if task_type == 'regression':
        mse = mean_squared_error(y_test, y_pred)  # Calculate MSE
        r2 = r2_score(y_test, y_pred)  # Calculate R2
        print(f"Mean Squared Error: {mse}, R-squared: {r2}")
        return y_pred, (mse, r2)
    else:
        accuracy = accuracy_score(y_test, y_pred)  # Calculate accuracy
        print(f"Accuracy: {accuracy}")
        return y_pred, accuracy


# Function to plot results (tree structure or feature importance, and confusion/actual vs pred)
def plot_results(model, feature_cols, y_test, y_pred, task_type='regression'):
    """
    Plots tree or feature importance, and task-specific graph.
    :param model: Trained model.
    :param feature_cols: List of feature names for labels.
    :param y_test: Actual values.
    :param y_pred: Predicted values.
    :param task_type: 'regression' or 'classification'.
    """
    # Plot feature importance
    plt.figure(figsize=(10, 6))  # Set figure size
    importances = model.feature_importances_  # Get feature importances
    indices = importances.argsort()  # Sort indices
    plt.barh(range(len(indices)), importances[indices], align='center')  # Bar plot
    plt.yticks(range(len(indices)), [feature_cols[i] for i in indices])  # Y ticks with feature names
    plt.xlabel('Feature Importance')  # X label
    plt.title('Feature Importances')  # Title
    plt.show()  # Display

    # Task-specific plot
    if task_type == 'regression':
        plt.figure(figsize=(10, 6))
        plt.scatter(y_test, y_pred, alpha=0.5)  # Scatter actual vs pred
        plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--')  # Ideal line
        plt.xlabel('Actual')
        plt.ylabel('Predicted')
        plt.title('Actual vs Predicted')
        plt.show()
    else:
        cm = confusion_matrix(y_test, y_pred)  # Confusion matrix
        disp = ConfusionMatrixDisplay(confusion_matrix=cm)
        disp.plot(cmap=plt.cm.Blues)  # Plot
        plt.title('Confusion Matrix')
        plt.show()


# Optional: If graphviz is installed, use this to visualize the tree
# from sklearn.tree import export_graphviz
# import graphviz
# dot_data = export_graphviz(model, out_file=None, feature_names=feature_cols, filled=True)
# graph = graphviz.Source(dot_data)
# graph.render("decision_tree")  # Saves as PDF

# Example usage
if __name__ == "__main__":
    file_path = 'your_dataset.csv'  # Replace
    feature_cols = ['feature1', 'feature2']  # Replace
    target_col = 'target'  # Replace
    task_type = 'regression'  # Or 'classification'

    data = load_data(file_path)
    X_train, X_test, y_train, y_test = preprocess_data(data, feature_cols, target_col)
    model = train_model(X_train, y_train, task_type)
    y_pred, metric = evaluate_model(model, X_test, y_test, task_type)
    plot_results(model, feature_cols, y_test, y_pred, task_type)