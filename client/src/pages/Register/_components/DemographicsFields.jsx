import { Input } from '../../../components/Input';

export const DemographicsFields = ({ formData, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="mb-2 text-sm font-medium text-gray-700">
        Optional Information
      </div>

      <Input
        type="number"
        label="Age"
        placeholder="Your age"
        value={formData.age}
        onChange={e => onChange('age', e.target.value)}
        min="13"
        max="120"
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Gender
        </label>
        <select
          className="w-full rounded-lg border border-gray-300 px-4 py-2 transition outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
          value={formData.gender}
          onChange={e => onChange('gender', e.target.value)}
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer-not-to-say">Prefer not to say</option>
        </select>
      </div>

      <Input
        type="text"
        label="Occupation"
        placeholder="Your occupation"
        value={formData.occupation}
        onChange={e => onChange('occupation', e.target.value)}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <Input
          type="text"
          placeholder="Country"
          value={formData.location.country}
          onChange={e => onChange('location.country', e.target.value)}
        />
        <Input
          type="text"
          placeholder="State"
          value={formData.location.state}
          onChange={e => onChange('location.state', e.target.value)}
        />
        <Input
          type="text"
          placeholder="City"
          value={formData.location.city}
          onChange={e => onChange('location.city', e.target.value)}
        />
      </div>
    </div>
  );
};
