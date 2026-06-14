

interface SectionHeadingProps {
    title: string;
    subtitle?: string;
}

const SectionHeading = ({ title, subtitle }: SectionHeadingProps) => {
    return (
        <div className="section-header">
            {subtitle && (
                <p className="section-subtitle">{subtitle}</p>
            )}
            <h2 className="section-title">{title}</h2>
        </div>
    );
};

export default SectionHeading;