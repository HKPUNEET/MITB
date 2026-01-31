import pandas as pd  # Data handling
from sklearn.model_selection import train_test_split  # Splitting
from sklearn.preprocessing import StandardScaler  # Scaling
import xgboost as xgb  # XGBoost library
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, confusion_matrix, ConfusionMatrixDisplay  # Metrics
import matplotlib.pyplot as plt  # Plotting


# Reuse load_data and preprocess_data

# Function to train the XGBoost model
def train_model(X_train, y_train, X_test, y_test, task_type='regression', n_estimators=100, early_stopping_rounds=10):
    """
    Trains an XGBoost model with early stopping.
    :param X_train: Training features.
    :param y_train: Training targets.
    :param X_test: Test features (for eval).
    :param y_test: Test targets (for eval).
    :param task_type: 'regression' or 'classification'.
    :param n_estimators: Number of boosting rounds.
    :param early_stopping_rounds: Rounds for early stopping.
    :return: Trained model.
    """
    if task_type == 'regression':
        objective = 'reg:squarederror'  # Regression objective
    else:
        objective = 'binary:logistic'  # Classification (binary; for multi-class, adjust)

    dtrain = xgb.DMatrix(X_train, label=y_train)  # Create DMatrix for train
    dtest = xgb.DMatrix(X_test, label=y_test)  # For test/eval
    params = {
        'objective': objective,  # Set objective
        'eval_metric': 'rmse' if task_type == 'regression' else 'logloss',  # Metric
        'seed': 42  # Random seed
    }
    evals = [(dtrain, 'train'), (dtest, 'eval')]  # Eval list
    model = xgb.train(params, dtrain, n_estimators, evals=evals,
                      early_stopping_rounds=early_stopping_rounds, verbose_eval=False)  # Train with early stop
    return model


# Function to evaluate the model
def evaluate_model(model, X_test, y_test, task_type='regression'):
    """
    Evaluates XGBoost model.
    :param model: Trained model.
    :param X_test: Test features.
    :param y_test: Test targets.
    :param task_type: 'regression' or 'classification'.
    :return: Predictions and metric.
    """
    dtest = xgb.DMatrix(X_test)  # DMatrix for test
    y_pred = model.predict(dtest)  # Predict
    if task_type == 'classification':
        y_pred = (y_pred > 0.5).astype(int)  # Threshold for binary class
    if task_type == 'regression':
        mse = mean_squared_error(y_test, y_pred)  # MSE
        r2 = r2_score(y_test, y_pred)  # R2
        print(f"Mean Squared Error: {mse}, R-squared: {r2}")
        return y_pred, (mse, r2)
    else:
        accuracy = accuracy_score(y_test, y_pred)  # Accuracy
        print(f"Accuracy: {accuracy}")
        return y_pred, accuracy


# Function to plot results (feature importance and task-specific)
def plot_results(model, feature_cols, y_test, y_pred, task_type='regression'):
    """
    Plots feature importance and actual vs pred or confusion matrix.
    :param model: Trained model.
    :param feature_cols: Feature names.
    :param y_test: Actual.
    :param y_pred: Predicted.
    :param task_type: 'regression' or 'classification'.
    """
    # Feature importance
    xgb.plot_importance(model)  # XGBoost built-in importance plot
    plt.title('Feature Importances')  # Title
    plt.show()  # Display

    # Task-specific
    if task_type == 'regression':
        plt.figure(figsize=(10, 6))
        plt.scatter(y_test, y_pred, alpha=0.5)  # Scatter
        plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--')  # Line
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
    model = train_model(X_train, y_train, X_test, y_test, task_type)
    y_pred, metric = evaluate_model(model, X_test, y_test, task_type)
    plot_results(model, feature_cols, y_test, y_pred, task_type)