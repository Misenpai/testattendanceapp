// component/profile/DepartmentDisplay.tsx
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import React from 'react';
import {
  ActivityIndicator,
  Text,
  View,
} from 'react-native';

interface DepartmentDisplayProps {
  departmentLabel: string | null; // The department name to display
  updating: boolean;
}

export const DepartmentDisplay: React.FC<DepartmentDisplayProps> = ({
  departmentLabel,
  updating,
}) => {
  const displayText = departmentLabel || 'Not Assigned';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Department</Text>
      
      <View
        style={[
          styles.selector,
          updating && styles.disabled
        ]}
      >
        <View style={styles.selectorContent}>
          <FontAwesome6 
            name="building" 
            size={16} 
            color="#64748b" 
            style={styles.icon}
          />
          <Text style={styles.selectorText} numberOfLines={1}>
            {displayText}
          </Text>
        </View>
        {updating && (
          <ActivityIndicator size="small" color="#007AFF" />
        )}
      </View>

      {updating && (
        <View style={styles.updatingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.updatingText}>Updating location...</Text>
        </View>
      )}
    </View>
  );
};

const styles = {
  container: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  selector: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  selectorContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  selectorText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  disabled: {
    opacity: 0.6,
  },
  updatingContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  updatingText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '500' as const,
  },
};